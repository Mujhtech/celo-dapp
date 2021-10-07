import React from 'react'
import { BeatLoader } from 'react-spinners'

export default function Loading() {
    return (
        <div className="container" style={{textAlign: 'center'}}>
            <h2>Connecting to celo...</h2>
            <BeatLoader/>
        </div>
    )
}
