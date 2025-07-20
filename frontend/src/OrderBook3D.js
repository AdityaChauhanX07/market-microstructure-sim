import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const Bar = ({ position, scale, color }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.4, scale, 0.4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const OrderBook3D = ({ data }) => {
  const { bids, asks } = data;

  // Memoize calculations to avoid re-computing on every render
  const { maxVolume, midPrice, bidBars, askBars } = useMemo(() => {
    const allVolumes = [...bids.map(b => b.volume), ...asks.map(a => a.volume)];
    const maxVol = Math.max(...allVolumes, 1); // Avoid division by zero

    const maxBid = bids.length > 0 ? bids[0].price : 100;
    const minAsk = asks.length > 0 ? asks[0].price : 100;
    const mid = (maxBid + minAsk) / 2;

    const bidItems = bids.map(bid => ({
      ...bid,
      position: [(bid.price - mid) * 2, (bid.volume / maxVol * 5) / 2, 0.5],
      scale: bid.volume / maxVol * 5,
    }));

    const askItems = asks.map(ask => ({
      ...ask,
      position: [(ask.price - mid) * 2, (ask.volume / maxVol * 5) / 2, -0.5],
      scale: ask.volume / maxVol * 5,
    }));

    return { maxVolume: maxVol, midPrice: mid, bidBars: bidItems, askBars: askItems };
  }, [bids, asks]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Render Bid Bars */}
        {bidBars.map(bar => (
          <Bar key={`bid-${bar.price}`} position={bar.position} scale={bar.scale} color="#4CAF50" />
        ))}

        {/* Render Ask Bars */}
        {askBars.map(bar => (
          <Bar key={`ask-${bar.price}`} position={bar.position} scale={bar.scale} color="#F44336" />
        ))}

        {/* Center line and text */}
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.05, 0.1, 15]}/>
            <meshStandardMaterial color="white"/>
        </mesh>
        <Text position={[0, -0.5, 0]} fontSize={0.5} color="white" anchorX="center">
            {midPrice.toFixed(2)}
        </Text>

        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default OrderBook3D;