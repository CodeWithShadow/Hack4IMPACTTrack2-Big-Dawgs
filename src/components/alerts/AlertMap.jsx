import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center]);
    return null;
}

const severityColors = { low: '#4ADE80', medium: '#F59E0B', high: '#EF4444' };

export default function AlertMap({ alerts = [], center = [20.5937, 78.9629], zoom = 5, onMarkerClick }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-lg overflow-hidden border border-farm-border h-[500px] md:h-[600px]"
        >
            <MapContainer
                center={center}
                zoom={zoom}
                className="h-full w-full"
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                <MapUpdater center={center} />

                {alerts.map((alert, i) => {
                    const color = severityColors[alert.severity] || severityColors.medium;
                    const lat = alert.latitude || alert.lat || 20;
                    const lng = alert.longitude || alert.lng || 78;

                    return (
                        <CircleMarker
                            key={alert.id || i}
                            center={[lat, lng]}
                            radius={10}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.4,
                                weight: 2,
                            }}
                            eventHandlers={{
                                click: () => onMarkerClick && onMarkerClick(alert),
                            }}
                        >
                            <Popup>
                                <div className="text-sm space-y-1">
                                    <p className="font-bold">{alert.disease_name || 'Unknown Disease'}</p>
                                    <p className="text-gray-600">Crop: {alert.crop_name || 'N/A'}</p>
                                    <p className="text-gray-600">Severity: <span style={{ color }}>{alert.severity}</span></p>
                                    {alert.created_at && (
                                        <p className="text-gray-400 text-xs">{new Date(alert.created_at).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </motion.div>
    );
}
