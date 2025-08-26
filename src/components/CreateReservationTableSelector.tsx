import React from 'react';
import { TableLayoutSelector } from './TableLayoutSelector';
import { useTableAvailability } from '@/hooks/useTableAvailability';

interface CreateReservationTableSelectorProps {
  tables: Array<{
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
  }>;
  selectedTableId?: string;
  onTableSelect: (tableId: string) => void;
  reservationType: 'dining' | 'nightlife';
  selectedDate?: string;
  eventId?: string;
  className?: string;
}

export const CreateReservationTableSelector: React.FC<CreateReservationTableSelectorProps> = ({
  tables,
  selectedTableId,
  onTableSelect,
  reservationType,
  selectedDate,
  eventId,
  className,
}) => {
  const { reservations, loading } = useTableAvailability(
    reservationType,
    selectedDate,
    eventId
  );

  if (loading) {
    return (
      <div className="w-full h-[400px] border rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading table availability...</div>
      </div>
    );
  }

  return (
    <TableLayoutSelector
      tables={tables}
      selectedTableId={selectedTableId}
      onTableSelect={onTableSelect}
      reservationType={reservationType}
      existingReservations={reservations}
      className={className}
    />
  );
};