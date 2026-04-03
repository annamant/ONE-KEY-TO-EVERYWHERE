import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="bg-okte-navy-900 text-okte-navy-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-okte-navy-900 font-bold text-body-sm">K</span>
              </div>
              <span className="font-bold text-white">One Key to Everywhere</span>
            </div>
            <p className="text-body-sm leading-relaxed">
              Unlock extraordinary homes worldwide with one simple membership.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-body-sm mb-4">Product</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/waitlist" className="hover:text-white transition-colors">Join Waitlist</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-body-sm mb-4">Members</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-body-sm mb-4">Owners</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/auth/signup" className="hover:text-white transition-colors">List Your Property</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-okte-navy-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-caption">© 2026 One Key to Everywhere. All rights reserved.</p>
          <div className="flex gap-4 text-caption">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
