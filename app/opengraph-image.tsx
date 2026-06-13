import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PortalKit — Client Portal Software for Freelancers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0051d5 0%, #0038a8 50%, #001f6b 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
          }}
        />

        {/* PK badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            marginBottom: 36,
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-1px',
            }}
          >
            PK
          </span>
        </div>

        {/* Product name */}
        <div
          style={{
            color: 'white',
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: '-3px',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          PortalKit
        </div>

        {/* Tagline */}
        <div
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 32,
            fontWeight: 400,
            textAlign: 'center',
            maxWidth: 760,
            lineHeight: 1.4,
          }}
        >
          The client portal every freelancer wishes they had
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            color: 'rgba(255,255,255,0.35)',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}
        >
          portalkit.app
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
