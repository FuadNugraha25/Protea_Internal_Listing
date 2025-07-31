// src/Login.jsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../supabaseClient'

export default function Login() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '1rem' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-0">Hi! Login dulu yuk</h3>
          <small className="text-muted">Masuknya pakai email protea yaa 😊</small>
        </div>
        <Auth 
          supabaseClient={supabase} 
          appearance={{ 
            theme: ThemeSupa,
            elements: {
              avatar: { display: false },
              forgotPassword: { display: 'none' },
              signUp: { display: 'none' },
              // fallback for some versions:
              'button[data-testid="sign-up-button"]': { display: 'none' },
              'a[href*="recover"]': { display: 'none' },
            }
          }} 
          providers={[]}
          onlyThirdPartyProviders={false}
        />
      </div>
    </div>
  )
}
