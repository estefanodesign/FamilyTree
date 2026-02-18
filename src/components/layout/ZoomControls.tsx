import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface ZoomControlsProps {
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onToggleFullscreen: () => void;
    isFullscreen: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    scale,
    onZoomIn,
    onZoomOut,
    onReset,
    onToggleFullscreen,
    isFullscreen
}) => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-2xl rounded-full p-2 flex items-center gap-1 border border-white/20">
                <button
                    onClick={onZoomOut}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 active:scale-95"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5" />
                </button>

                <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center select-none tabular-nums">
                    {Math.round(scale * 100)}%
                </span>

                <button
                    onClick={onZoomIn}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 active:scale-95"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button
                    onClick={onReset}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 active:scale-95"
                    title="Reset View"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>

                <button
                    onClick={onToggleFullscreen}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 active:scale-95"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};
