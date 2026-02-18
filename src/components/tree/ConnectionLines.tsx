import React from 'react';
import { NodePosition } from '@/types/family';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const VERTICAL_SPACING = 220;

interface ConnectionLinesProps {
    positions: Map<string, NodePosition>;
    selectedPersonId: string | null;
    connectedNodes: Set<string>;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({ positions, selectedPersonId, connectedNodes }) => {
    const connections: React.ReactNode[] = [];
    const processedSpouses = new Set<string>();

    positions.forEach((pos) => {
        const person = pos.person;

        // Spouse connections - draw horizontal line with heart in middle
        if (person.spouseId && positions.has(person.spouseId)) {
            const spouseKey = [person.id, person.spouseId].sort().join('-');
            if (!processedSpouses.has(spouseKey)) {
                processedSpouses.add(spouseKey);
                const spousePos = positions.get(person.spouseId)!;

                // Determine left and right positions
                const leftPos = pos.x < spousePos.x ? pos : spousePos;
                const rightPos = pos.x < spousePos.x ? spousePos : pos;

                // Calculate connection points from edges of nodes
                const startX = leftPos.x + NODE_WIDTH / 2;  // Right edge of left node
                const endX = rightPos.x - NODE_WIDTH / 2;   // Left edge of right node
                const y = pos.y;
                const midX = (startX + endX) / 2;

                const isSpouseHighlighted = selectedPersonId &&
                    (connectedNodes.has(person.id) || connectedNodes.has(person.spouseId));

                connections.push(
                    <g key={`spouse-${spouseKey}`}>
                        {/* Horizontal spouse connection */}
                        <line
                            x1={startX}
                            y1={y}
                            x2={endX}
                            y2={y}
                            stroke={isSpouseHighlighted ? '#f59e0b' : '#f472b6'}
                            strokeWidth={isSpouseHighlighted ? 5 : 3}
                            strokeLinecap="round"
                            style={{
                                filter: isSpouseHighlighted ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' : 'none'
                            }}
                        />
                        {/* Heart in the middle */}
                        <g transform={`translate(${midX}, ${y})`}>
                            <circle
                                r={isSpouseHighlighted ? 16 : 12}
                                fill={isSpouseHighlighted ? '#fef3c7' : '#fce7f3'}
                                stroke={isSpouseHighlighted ? '#f59e0b' : '#f472b6'}
                                strokeWidth={isSpouseHighlighted ? 3 : 2}
                                style={{
                                    filter: isSpouseHighlighted ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))' : 'none'
                                }}
                            />
                            <text
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={isSpouseHighlighted ? 16 : 12}
                                fill={isSpouseHighlighted ? '#f59e0b' : '#f472b6'}
                            >
                                ♥
                            </text>
                        </g>
                    </g>
                );
            }
        }

        // Parent-child connections
        if (person.childrenIds.length > 0) {
            const childPositions = person.childrenIds
                .map(id => positions.get(id))
                .filter((p): p is NodePosition => !!p);

            if (childPositions.length > 0) {
                // Find parent's connection point (bottom center)
                const parentY = pos.y + NODE_HEIGHT / 2;

                // If person has spouse, calculate center point between them
                let parentX = pos.x;
                if (person.spouseId && positions.has(person.spouseId)) {
                    const spousePos = positions.get(person.spouseId)!;
                    parentX = (pos.x + spousePos.x) / 2;
                }

                // Calculate vertical drop point - add gap from node
                const dropY = parentY + VERTICAL_SPACING / 3;

                // Check if this parent-child connection should be highlighted
                const isParentHighlighted = selectedPersonId && connectedNodes.has(person.id);

                // Vertical line down from parent center
                connections.push(
                    <line
                        key={`parent-drop-${person.id}`}
                        x1={parentX}
                        y1={parentY}
                        x2={parentX}
                        y2={dropY}
                        stroke={isParentHighlighted ? '#f59e0b' : '#64748b'}
                        strokeWidth={isParentHighlighted ? 4 : 2}
                        strokeLinecap="round"
                        style={{
                            filter: isParentHighlighted ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' : 'none'
                        }}
                    />
                );

                // Horizontal line connecting all children at drop level
                if (childPositions.length > 0) {
                    const minChildX = Math.min(...childPositions.map(p => p.x));
                    const maxChildX = Math.max(...childPositions.map(p => p.x));
                    connections.push(
                        <line
                            key={`children-line-${person.id}`}
                            x1={minChildX}
                            y1={dropY}
                            x2={maxChildX}
                            y2={dropY}
                            stroke={isParentHighlighted ? '#f59e0b' : '#64748b'}
                            strokeWidth={isParentHighlighted ? 4 : 2}
                            strokeLinecap="round"
                            style={{
                                filter: isParentHighlighted ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' : 'none'
                            }}
                        />
                    );

                    // Vertical lines from horizontal to each child
                    childPositions.forEach(childPos => {
                        const childTopY = childPos.y - NODE_HEIGHT / 2;
                        const isChildHighlighted = selectedPersonId && connectedNodes.has(childPos.person.id);

                        connections.push(
                            <line
                                key={`child-conn-${person.id}-${childPos.person.id}`}
                                x1={childPos.x}
                                y1={dropY}
                                x2={childPos.x}
                                y2={childTopY}
                                stroke={isChildHighlighted || isParentHighlighted ? '#f59e0b' : '#64748b'}
                                strokeWidth={isChildHighlighted || isParentHighlighted ? 4 : 2}
                                strokeLinecap="round"
                                style={{
                                    filter: (isChildHighlighted || isParentHighlighted) ? 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.6))' : 'none'
                                }}
                            />
                        );
                    });
                }
            }
        }
    });

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {connections}
        </svg>
    );
};
