import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer style={{ background: '#0A0A0A', color: '#CCCCCC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C4882F' }}>
                <span className="font-bold text-body-sm" style={{ color: '#0A0A0A' }}>K</span>
              </div>
              <span className="font-bold" style={{ color: '#FFFFFF' }}>One Key to Everywhere</span>
            </div>
            <p className="text-body-sm leading-relaxed">
              A private Club for the finest homes in Puglia, Italy. Not a platform — a community built on trust.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-body-sm mb-4" style={{ color: '#FFFFFF' }}>The Club</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/how-it-works" className="transition-colors hover:text-white">How It Works</Link></li>
              <li><Link to="/pricing" className="transition-colors hover:text-white">Membership Plans</Link></li>
              <li><Link to="/waitlist" className="transition-colors hover:text-white">Apply to Join</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-body-sm mb-4" style={{ color: '#FFFFFF' }}>Members</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/auth/signup" className="transition-colors hover:text-white">Create Account</Link></li>
              <li><Link to="/auth/login" className="transition-colors hover:text-white">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-body-sm mb-4" style={{ color: '#FFFFFF' }}>Property Owners</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/open-doors" className="transition-colors hover:text-white">Open Your Doors</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-caption">© 2026 One Key to Everywhere · Puglia, Italy</p>
          <div className="flex gap-4 text-caption">
            <a href="#" className="transition-colors hover:text-white">Privacy</a>
            <a href="#" className="transition-colors hover:text-white">Terms</a>
            <a href="#" className="transition-colors hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
