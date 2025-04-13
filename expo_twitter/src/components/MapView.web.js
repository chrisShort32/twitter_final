import React from 'react';

export const MapView = ({ latitude, longitude, style }) => {
    return (
        <iframe
            width='100%'
            height='100%'
            style={style}
            src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
            allowFullScreen
        />
    );
};

export const Marker = () => null;