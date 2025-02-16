// app/components/Map.tsx
"use client";


interface MapProps {
    location: string;
}

const Map: React.FC<MapProps> = ({ location }) => {
    return (
        <iframe
            src={`https://www.google.com/maps/embed?pb=${location}`}
            width="500"
            height="400"
            style={{
                border: '1px solid #ba2121',
                padding: 5,
                borderRadius: "10px",
            }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        >

        </iframe>
    );
};

export default Map;
