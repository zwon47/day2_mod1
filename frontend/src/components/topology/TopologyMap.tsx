'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { TopologyNode, TopologyEdge } from '@/types/topology';

// Register dagre layout
cytoscape.use(dagre);

interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  layout?: 'dagre' | 'cose' | 'circle';
}

interface ContextMenu {
  x: number;
  y: number;
  nodeId?: string;
  edgeId?: string;
}

const TopologyMap = forwardRef<any, TopologyMapProps>(({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  layout = 'dagre'
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  // Expose cyRef to parent component
  useImperativeHandle(ref, () => ({
    cyRef
  }));

  // Node positions localStorage helpers
  const saveNodePositions = () => {
    const cy = cyRef.current;
    if (!cy) return;

    const positions: Record<string, { x: number; y: number }> = {};
    cy.nodes().forEach(node => {
      positions[node.id()] = node.position();
    });

    localStorage.setItem('topology-node-positions', JSON.stringify(positions));
  };

  const loadNodePositions = () => {
    const saved = localStorage.getItem('topology-node-positions');
    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const resetNodePositions = () => {
    localStorage.removeItem('topology-node-positions');
    const cy = cyRef.current;
    if (!cy) return;

    cy.layout({
      name: layout,
      rankDir: 'LR',
      nodeSep: 80,
      rankSep: 120,
      animate: true,
      animationDuration: 500
    } as any).run();
  };

  const highlightNode = (nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass('highlighted');
    const node = cy.getElementById(nodeId);
    node.addClass('highlighted');
    node.neighborhood().addClass('highlighted');
  };

  const centerNode = (nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    const node = cy.getElementById(nodeId);
    cy.animate({
      center: { elt: node as any },
      zoom: 1.5
    } as any, {
      duration: 500
    });
  };

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu) return;

    if (contextMenu.nodeId) {
      switch (action) {
        case 'details':
          onNodeClick?.(contextMenu.nodeId);
          break;
        case 'highlight':
          highlightNode(contextMenu.nodeId);
          break;
        case 'center':
          centerNode(contextMenu.nodeId);
          break;
      }
    }

    setContextMenu(null);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: nodes.map(n => ({
          data: {
            ...n,
            id: n.id,
            label: n.label
          }
        })),
        edges: edges.map(e => {
          // Determine edge color based on actions
          const hasAllow = e.metadata.actions.includes('ALLOW');
          const hasDeny = e.metadata.actions.includes('DENY');

          let edgeColor = '#4FC3F7'; // Default blue
          if (hasAllow && !hasDeny) {
            edgeColor = '#6BCB77'; // Green (ALLOW only)
          } else if (hasDeny && !hasAllow) {
            edgeColor = '#FF6B6B'; // Red (DENY only)
          } else if (hasAllow && hasDeny) {
            edgeColor = '#FFD93D'; // Yellow (mixed)
          }

          return {
            data: {
              id: e.id,
              source: e.from,
              target: e.to,
              label: e.label,
              edgeColor: edgeColor,
              ...e.metadata
            }
          };
        })
      },
      layout: {
        name: layout,
        rankDir: 'LR',
        nodeSep: 80,
        rankSep: 120,
        animate: true,
        animationDuration: 500
      } as any,
      style: [
        {
          selector: 'node',
          style: {
            'background-image': '/image/bluemax.png',
            'background-fit': 'cover',
            'background-clip': 'none',
            'background-opacity': 1,
            'border-width': 0,
            'border-color': 'data(color)',
            'border-opacity': 0,
            'width': 100,
            'height': 100,
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 10,
            'font-size': '14px',
            'color': '#ffffff',
            'text-outline-color': '#000000',
            'text-outline-width': 2,
            'text-background-color': 'rgba(0, 0, 0, 0.7)',
            'text-background-opacity': 0.7,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'shape': 'ellipse'
          } as any
        },
        {
          selector: 'node:hover',
          style: {
            'border-width': 0,
            'border-color': '#FFD700',
            'z-index': 999
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 6,
            'border-color': '#FFD700',
            'box-shadow': '0 0 30px #FFD700, 0 0 50px #FFD700',
            'z-index': 999
          } as any
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 5,
            'border-color': '#FFD700',
            'box-shadow': '0 0 30px #FFD700',
            'z-index': 999
          } as any
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': 'data(edgeColor)',
            'target-arrow-color': 'data(edgeColor)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '11px',
            'color': '#ffffff',
            'text-rotation': 'autorotate',
            'text-background-color': 'rgba(0, 0, 0, 0.8)',
            'text-background-opacity': 0.8,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'line-style': 'solid',
            'opacity': 0.8
          } as any
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 5,
            'line-color': '#FFD700',
            'target-arrow-color': '#FFD700',
            'opacity': 1,
            'z-index': 999
          }
        }
      ],
      // Performance optimization settings
      wheelSensitivity: 0.2,
      textureOnViewport: true,
      hideEdgesOnViewport: true,
      hideLabelsOnViewport: false,
      pixelRatio: 'auto',
      motionBlur: true,
      motionBlurOpacity: 0.2
    });

    // Load saved node positions
    const savedPositions = loadNodePositions();
    if (savedPositions) {
      cy.nodes().forEach(node => {
        const pos = savedPositions[node.id()];
        if (pos) {
          node.position(pos);
        }
      });
    }

    // Event handlers
    if (onNodeClick) {
      cy.on('tap', 'node', (evt) => {
        const node = evt.target;

        // Deselect other nodes
        cy.nodes().removeClass('selected');

        // Select current node
        node.addClass('selected');

        onNodeClick(node.id());
      });
    }

    if (onEdgeClick) {
      cy.on('tap', 'edge', (evt) => {
        onEdgeClick(evt.target.id());
      });
    }

    // Right-click context menu
    cy.on('cxttap', 'node', (evt) => {
      const node = evt.target;
      const renderedPosition = node.renderedPosition();

      setContextMenu({
        x: renderedPosition.x,
        y: renderedPosition.y,
        nodeId: node.id()
      });
    });

    cy.on('cxttap', 'edge', (evt) => {
      const edge = evt.target;
      const midpoint = edge.renderedMidpoint();

      setContextMenu({
        x: midpoint.x,
        y: midpoint.y,
        edgeId: edge.id()
      });
    });

    // Close context menu on empty space click
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setContextMenu(null);
      }
    });

    // Save node positions after drag
    cy.on('dragfree', 'node', () => {
      saveNodePositions();
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, layout, onNodeClick, onEdgeClick]);

  return (
    <>
      <div
        ref={containerRef}
        className="w-full h-full rounded-lg border border-gray-700 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
          position: 'relative'
        }}
      >
        {/* Space Background with Twinkling Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="stars-small" />
          <div className="stars-medium" />
          <div className="stars-large" />
        </div>
      </div>

      {/* Context Menu - Dark Theme */}
      {contextMenu && (
        <div
          className="fixed bg-gray-900 rounded-lg shadow-lg border border-gray-700 py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.nodeId && (
            <>
              <button
                onClick={() => handleContextMenuAction('details')}
                className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                View Details
              </button>
              <button
                onClick={() => handleContextMenuAction('highlight')}
                className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                Highlight Connections
              </button>
              <button
                onClick={() => handleContextMenuAction('center')}
                className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
              >
                Center View
              </button>
            </>
          )}
          {contextMenu.edgeId && (
            <button
              onClick={() => onEdgeClick?.(contextMenu.edgeId!)}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
            >
              View Rule Details
            </button>
          )}
        </div>
      )}
    </>
  );
});

TopologyMap.displayName = 'TopologyMap';

export default TopologyMap;
