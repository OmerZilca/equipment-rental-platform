/**
 * Responsive grid of equipment cards.
 */
import React from "react";
import EquipmentCard from "./EquipmentCard";
import type { Equipment } from "../../../types";

type Props = {
  equipmentList: Equipment[];
};

const EquipmentGrid: React.FC<Props> = ({ equipmentList }) => {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {equipmentList.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
};

export default EquipmentGrid;
