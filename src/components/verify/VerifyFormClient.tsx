'use client';

import dynamic from 'next/dynamic';

/** Client-only: it reads the code from the URL and formats dates in the viewer's time zone. */
export default dynamic(() => import('./VerifyForm').then((m) => m.VerifyForm), { ssr: false });
