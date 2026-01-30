'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectPage() {
  useEffect(() => {
    redirect('https://ordoservus.miraheze.org/wiki/');
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <p>Sie werden zum OrdoServus Wiki weitergeleitet...</p>
      <p>
        Wenn Sie nicht automatisch weitergeleitet werden, klicken Sie bitte hier:
        <a href="https://ordoservus.miraheze.org/wiki/" style={{ color: '#3498db' }}>
          OrdoServus Wiki
        </a>
      </p>
    </div>
  );
}
