// js/tree.js
// D3 v7 collapsible left-to-right tidy tree
// Structure: Root → Branch → Category → Actual Book → [Speculative successors]
// Speculative nodes hang off their connected actual book with dashed gold links.

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TRANSITION_MS = prefersReducedMotion ? 0 : 400;

  var svg, gMain, gLinks, gNodes;
  var treeLayout, root;
  var width, height;

  // Dimensions
  var margin = { top: 30, right: 200, bottom: 30, left: 140 };
  var nodeR  = { root: 14, branch: 11, category: 8, book: 4, speculative: 4 };

  // ─── Build tree data ───────────────────────────────────────────────────────
  function buildTreeData(actualBooks, speculativeBooks) {
    var data     = window.BOYD_DATA;
    if (!data) return null;
    var branches = data.BRANCHES;

    // Index speculative books by the actual book slug they build from
    var specByParent = {};
    speculativeBooks.forEach(function (book) {
      var fromId = book.connectionEdge && book.connectionEdge.fromId;
      if (!fromId) return;
      if (!specByParent[fromId]) specByParent[fromId] = [];
      specByParent[fromId].push(book);
    });

    // Group actual books by branch → category
    var branchMap = {};
    Object.keys(branches).forEach(function (bId) {
      branchMap[bId] = { name: branches[bId].label, id: bId, color: branches[bId].color, children: {} };
    });

    actualBooks.forEach(function (book) {
      var bId = book.branch || 'science';
      var cat = book.category;
      if (!branchMap[bId]) return;
      if (!branchMap[bId].children[cat]) {
        branchMap[bId].children[cat] = {
          name: cat, category: cat, branch: bId, color: branches[bId].color, books: []
        };
      }
      branchMap[bId].children[cat].books.push(book);
    });

    // Build hierarchy: Root → Branch → Category → Book → [Speculative]
    var rootData = {
      name:  "John Boyd's Library",
      type:  'root',
      color: '#c9a84c',
      children: Object.keys(branchMap).map(function (bId) {
        var branch = branchMap[bId];
        return {
          name:  branch.name,
          id:    bId,
          type:  'branch',
          color: branch.color,
          children: Object.keys(branch.children).map(function (cat) {
            var catNode = branch.children[cat];
            var catBooks = catNode.books.slice().sort(function (a, b) { return b.rating - a.rating; });
            return {
              name:      cat,
              category:  cat,
              branch:    bId,
              type:      'category',
              color:     catNode.color,
              bookCount: catBooks.length,
              avgRating: catBooks.reduce(function (s, b) { return s + b.rating; }, 0) / catBooks.length,
              topBooks:  catBooks.slice(0, 3).map(function (b) { return b.title; }),
              children:  catBooks.map(function (book) {
                var successors = specByParent[book.slug] || [];
                var bookNode = {
                  name:   book.title,
                  slug:   book.slug,
                  author: book.author,
                  year:   book.year,
                  rating: book.rating,
                  branch: bId,
                  type:   'book',
                  color:  branch.color,
                };
                // Attach speculative successors as children of this actual book
                if (successors.length > 0) {
                  bookNode.children = successors.map(function (s) {
                    return {
                      name:           s.title,
                      slug:           s.slug,
                      author:         s.author,
                      year:           s.year,
                      rating:         s.rating,
                      branch:         bId,
                      type:           'speculative',
                      color:          '#c9a84c',
                      connectionType: s.connectionEdge ? s.connectionEdge.connectionType : 'successor',
                      justification:  s.connectionEdge ? s.connectionEdge.justification  : '',
                    };
                  });
                }
                return bookNode;
              }),
            };
          }),
        };
      }),
    };
    return rootData;
  }

  // ─── Diagonal link path ────────────────────────────────────────────────────
  function diagonal(s, d) {
    return 'M '  + s.y + ' ' + s.x +
           ' C ' + ((s.y + d.y) / 2) + ' ' + s.x +
           ', '  + ((s.y + d.y) / 2) + ' ' + d.x +
           ', '  + d.y + ' ' + d.x;
  }

  // ─── Collapse helpers ──────────────────────────────────────────────────────
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function toggleNode(d) {
    if (d.children) {
      d._children = d.children;
      d.children  = null;
    } else if (d._children) {
      d.children  = d._children;
      d._children = null;
    }
  }

  // ─── Update tree ──────────────────────────────────────────────────────────
  var nodeIdCounter = 0;

  function update(source) {
    var treeData = treeLayout(root);
    var nodes    = treeData.descendants();
    var links    = treeData.links();

    // Horizontal spacing per depth level
    nodes.forEach(function (d) { d.y = d.depth * 260; });

    // ── Nodes ──────────────────────────────────────────────────────────────
    var node = gNodes.selectAll('g.tree-node')
      .data(nodes, function (d) { return d.id || (d.id = ++nodeIdCounter); });

    var nodeEnter = node.enter().append('g')
      .attr('class', function (d) { return 'tree-node node-' + (d.data.type || 'book'); })
      .attr('transform', function () { return 'translate(' + source._y0 + ',' + source._x0 + ')'; })
      .style('opacity', 0);

    // Circles
    nodeEnter.append('circle')
      .attr('r', function (d) { return nodeR[d.data.type] || nodeR.book; })
      .attr('class', 'node-circle')
      .call(_styleCircle)
      .style('cursor', function (d) {
        if (d.data.type === 'speculative') return 'default';
        if (d.data.type === 'book' && !d.children && !d._children) return 'default';
        return 'pointer';
      });

    // Labels
    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.32em')
      .attr('x', function (d) {
        var r = nodeR[d.data.type] || nodeR.book;
        return (d.children || d._children) ? -(r + 8) : (r + 8);
      })
      .attr('text-anchor', function (d) {
        return (d.children || d._children) ? 'end' : 'start';
      })
      .text(function (d) {
        var t = d.data.name;
        var max = (d.data.type === 'book' || d.data.type === 'speculative') ? 36 : 999;
        return t.length > max ? t.slice(0, max - 2) + '…' : t;
      })
      .style('font-size', function (d) {
        if (d.data.type === 'root')        return '16px';
        if (d.data.type === 'branch')      return '14px';
        if (d.data.type === 'category')    return '13px';
        if (d.data.type === 'speculative') return '10px';
        return '11px';
      })
      .style('fill', function (d) {
        if (d.data.type === 'root')        return '#c9a84c';
        if (d.data.type === 'branch')      return '#e8e2d4';
        if (d.data.type === 'category')    return '#bdb5a6';
        if (d.data.type === 'speculative') return '#7a6530';
        return '#9a9288';
      })
      .style('font-style', function (d) {
        return d.data.type === 'speculative' ? 'italic' : 'normal';
      });

    // Click handler
    nodeEnter.on('click', function (event, d) {
      // Speculative are pure leaves — no interaction
      if (d.data.type === 'speculative') return;
      // Actual books with no successors — no interaction
      if (d.data.type === 'book' && !d.children && !d._children) return;

      event.stopPropagation();
      toggleNode(d);

      if (d.data.type === 'category' && window.BoydState) {
        window.BoydState.setCategory(d.data.category);
      } else if (d.data.type === 'branch' && window.BoydState) {
        window.BoydState.setBranch(d.data.id);
      }
      update(d);
    });

    // Transition in
    var nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition().duration(TRANSITION_MS)
      .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')'; })
      .style('opacity', 1);

    // Re-style circles after toggle (collapsed vs expanded state changes fill)
    nodeUpdate.select('circle').call(_styleCircle);

    // Exit
    node.exit().transition().duration(TRANSITION_MS)
      .attr('transform', function () { return 'translate(' + source.y + ',' + source.x + ')'; })
      .style('opacity', 0)
      .remove();

    // ── Links ──────────────────────────────────────────────────────────────
    var link = gLinks.selectAll('path.tree-link')
      .data(links, function (d) { return d.target.id; });

    var linkEnter = link.enter().insert('path', 'g')
      .attr('class', function (d) {
        return 'tree-link' + (d.target.data.type === 'speculative' ? ' tree-link-speculative' : '');
      })
      .attr('d', function () {
        var o = { x: source._x0, y: source._y0 };
        return diagonal(o, o);
      });

    link.merge(linkEnter).transition().duration(TRANSITION_MS)
      .attr('d', function (d) { return diagonal(d.source, d.target); });

    link.exit().transition().duration(TRANSITION_MS)
      .attr('d', function () {
        var o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    // Store positions for next transition
    nodes.forEach(function (d) { d._x0 = d.x; d._y0 = d.y; });
  }

  // ─── Circle style helper ──────────────────────────────────────────────────
  function _styleCircle(sel) {
    sel
      .attr('fill', function (d) {
        if (d.data.type === 'root')        return '#c9a84c';
        if (d.data.type === 'branch')      return d.data.color || '#888';
        if (d.data.type === 'category')    return d.data.color || '#555';
        if (d.data.type === 'speculative') return 'transparent';
        // actual book: filled with branch color if collapsed (has hidden children), dim if leaf
        return (d._children) ? (d.data.color || '#555') : '#2a2a2a';
      })
      .attr('stroke', function (d) {
        if (d.data.type === 'speculative') return '#c9a84c';
        if (d._children)                   return d.data.color || '#888';
        return 'transparent';
      })
      .attr('stroke-width', function (d) {
        return d.data.type === 'speculative' ? 1.5 : 2;
      })
      .attr('stroke-dasharray', function (d) {
        return d.data.type === 'speculative' ? '3,2' : 'none';
      });
  }

  // ─── Compute SVG height from visible leaves ───────────────────────────────
  function computeHeight(rootNode) {
    var leaves = 0;
    rootNode.each(function (d) { if (!d.children && !d._children) leaves++; });
    return Math.max(700, leaves * 28);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init(actualBooks, speculativeBooks) {
    var wrapper = document.getElementById('tree-wrapper');
    if (!wrapper || typeof d3 === 'undefined') return;

    var containerW = wrapper.parentElement.offsetWidth || 900;
    width = Math.max(containerW, 700) - margin.left - margin.right;

    var treeData = buildTreeData(actualBooks, speculativeBooks);
    if (!treeData) return;

    root = d3.hierarchy(treeData);
    root._x0 = 0;
    root._y0 = 0;

    // Initial state: branches visible, categories collapsed (books hidden)
    root.children && root.children.forEach(function (branch) {
      branch.children && branch.children.forEach(function (cat) {
        collapse(cat);
      });
    });

    treeLayout = d3.tree().nodeSize([26, 260]);
    treeLayout(root);
    height = computeHeight(root);

    var svgEl = d3.select(wrapper).append('svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top  + margin.bottom)
      .attr('class', 'tree-svg');

    var zoom = d3.zoom()
      .scaleExtent([0.25, 3])
      .on('zoom', function (event) { gMain.attr('transform', event.transform); });

    svgEl.call(zoom);

    svgEl.on('keydown', function (event) {
      if (event.key === '+' || event.key === '=') zoom.scaleBy(svgEl.transition().duration(200), 1.2);
      else if (event.key === '-')                  zoom.scaleBy(svgEl.transition().duration(200), 0.8);
    });

    svg   = svgEl;
    var initCenterY = (wrapper.clientHeight || 600) / 2;
    gMain = svgEl.append('g').attr('transform', 'translate(' + margin.left + ',' + initCenterY + ')');
    svgEl.call(zoom.transform, d3.zoomIdentity.translate(margin.left, initCenterY));
    gLinks = gMain.append('g').attr('class', 'links');
    gNodes = gMain.append('g').attr('class', 'nodes');

    update(root);

    // Reset button
    var resetBtn = document.getElementById('tree-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        root.children && root.children.forEach(function (branch) {
          branch.children && branch.children.forEach(function (cat) { collapse(cat); });
        });
        var centerY = (wrapper.clientHeight || 600) / 2;
        svgEl.transition().duration(TRANSITION_MS)
          .call(zoom.transform, d3.zoomIdentity.translate(margin.left, centerY));
        update(root);
        if (window.BoydState) window.BoydState.clearFilters();
      });
    }

    if (window.BoydState) {
      window.BoydState.subscribe(function (state) { _highlightNodes(state); });
    }
  }

  // ─── Highlight active category/branch nodes ───────────────────────────────
  function _highlightNodes(state) {
    if (!gNodes) return;
    gNodes.selectAll('g.tree-node').each(function (d) {
      var active = false;
      if (state.selectedCategory && d.data.type === 'category') {
        active = d.data.category === state.selectedCategory;
      } else if (state.selectedBranch && d.data.type === 'branch') {
        active = d.data.id === state.selectedBranch;
      }
      d3.select(this).select('circle')
        .attr('stroke-width', active ? 3.5 : function (d2) {
          return d2.data.type === 'speculative' ? 1.5 : 2;
        })
        .attr('stroke', active ? '#c9a84c' : function (d2) {
          if (d2.data.type === 'speculative') return '#c9a84c';
          return d2._children ? (d2.data.color || '#888') : 'transparent';
        });
    });
  }

  function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.BoydTree = { init: init };

})();
