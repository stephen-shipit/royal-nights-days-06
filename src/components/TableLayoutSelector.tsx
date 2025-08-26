import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from "@/lib/utils";

interface VenueTable {
  id: string;
  table_number: number;
  max_guests: number;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  location?: string;
  reservation_price: number;
  is_available: boolean;
}

interface TableLayoutSelectorProps {
  tables: VenueTable[];
  selectedTableId?: string;
  onTableSelect: (tableId: string) => void;
  reservationType: 'dining' | 'nightlife';
  className?: string;
  existingReservations?: Array<{
    table_id: string;
    status: string;
    guest_name?: string;
    guest_count?: number;
  }>;
}

const TableNode = ({ data }: { data: any }) => {
  const { table, isSelected, onClick, reservationType, isReserved, reservation } = data;
  
  const getTableStatus = () => {
    if (isReserved) return 'reserved';
    if (!table.is_available) return 'unavailable';
    return 'available';
  };

  const getTableClasses = () => {
    const status = getTableStatus();
    const baseClasses = "flex flex-col items-center justify-center text-xs font-medium rounded-md border-2 transition-colors min-w-[60px] min-h-[60px] p-2";
    
    if (isSelected) {
      return cn(baseClasses, "bg-primary text-primary-foreground border-primary shadow-lg cursor-pointer");
    }
    
    switch (status) {
      case 'reserved':
        return cn(baseClasses, "bg-red-100 text-red-800 border-red-300 cursor-not-allowed opacity-75 relative");
      case 'unavailable':
        return cn(baseClasses, "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50");
      default:
        return cn(baseClasses, "bg-background text-foreground border-border hover:bg-muted hover:border-muted-foreground cursor-pointer");
    }
  };
  
  return (
    <div
      onClick={() => getTableStatus() === 'available' && onClick(table.id)}
      className={getTableClasses()}
      style={{
        width: `${Math.max(table.width, 60)}px`,
        height: `${Math.max(table.height, 60)}px`,
      }}
    >
      {isReserved && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500 opacity-20 rounded-md"></div>
          <div className="text-red-600 font-bold text-lg z-10">✕</div>
        </div>
      )}
      <div className="font-bold">T{table.table_number}</div>
      <div className="text-[10px] text-center">
        {table.max_guests} seats
      </div>
      {isReserved && reservation && (
        <div className="text-[9px] text-center font-medium text-red-700">
          {reservation.guest_name}
        </div>
      )}
      {reservationType === 'nightlife' && table.reservation_price > 0 && (
        <div className="text-[10px] text-center font-medium">
          ${(table.reservation_price / 100).toFixed(0)}
        </div>
      )}
      {table.location && (
        <div className="text-[9px] text-center opacity-75">
          {table.location}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

export const TableLayoutSelector: React.FC<TableLayoutSelectorProps> = ({
  tables,
  selectedTableId,
  onTableSelect,
  reservationType,
  className,
  existingReservations = [],
}) => {
  const initialNodes: Node[] = useMemo(() => {
    return tables.map((table) => {
      const reservation = existingReservations.find(r => r.table_id === table.id);
      const isReserved = reservation && ['confirmed', 'pending'].includes(reservation.status);
      
      return {
        id: table.id,
        type: 'tableNode',
        position: { x: table.position_x, y: table.position_y },
        data: {
          table,
          isSelected: selectedTableId === table.id,
          onClick: onTableSelect,
          reservationType,
          isReserved,
          reservation,
        },
        draggable: false,
        selectable: false,
      };
    });
  }, [tables, selectedTableId, onTableSelect, reservationType, existingReservations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes when selectedTableId changes
  React.useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: selectedTableId === node.id,
        },
      }))
    );
  }, [selectedTableId, setNodes]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const table = node.data?.table as VenueTable;
      if (table?.is_available) {
        onTableSelect(node.id);
      }
    },
    [onTableSelect]
  );

  return (
    <div className={cn("w-full h-[400px] border rounded-lg overflow-hidden", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        proOptions={{
          hideAttribution: true,
        }}
        panOnScroll
        selectionOnDrag={false}
        panOnDrag={[1, 2]}
        zoomOnScroll={false}
        zoomOnPinch
        preventScrolling={false}
        style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
      >
        <Background color="hsl(var(--border))" gap={20} size={1} />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          position="top-right"
        />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const table = node.data?.table as VenueTable;
            if (node.data?.isSelected) return 'hsl(var(--primary))';
            if (!table?.is_available) return 'hsl(var(--muted-foreground))';
            return 'hsl(var(--background))';
          }}
          maskColor="hsl(var(--muted) / 0.6)"
          position="bottom-right"
          style={{
            height: 80,
            width: 120,
          }}
        />
      </ReactFlow>
      
      <div className="p-3 bg-muted/30 border-t text-sm">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-background border-2 border-border rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary border-2 border-primary rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded relative">
              <div className="absolute inset-0 flex items-center justify-center text-red-600 text-xs">✕</div>
            </div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted border-2 border-muted rounded opacity-50"></div>
            <span>Unavailable</span>
          </div>
        </div>
        {selectedTableId && (
          <div className="mt-2 text-xs text-muted-foreground">
            Click on a table to select it for your reservation
          </div>
        )}
      </div>
    </div>
  );
};