import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer style={{ background: '#2C1810', color: '#C4A882' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C4882F' }}>
                <span className="font-bold text-body-sm" style={{ color: '#2C1810' }}>K</span>
              </div>
              <span className="font-bold" style={{ color: '#FDFAF5' }}>One Key to Everywhere</span>
            </div>
            <p className="text-body-sm leading-relaxed">
              Il Club privato per le case più belle della Puglia. Non una piattaforma — una comunità di persone che si fidano l'una dell'altra.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-body-sm mb-4" style={{ color: '#FDFAF5' }}>Il Club</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/how-it-works" className="transition-colors hover:text-white">Come funziona</Link></li>
              <li><Link to="/pricing" className="transition-colors hover:text-white">Piani di membership</Link></li>
              <li><Link to="/waitlist" className="transition-colors hover:text-white">Lista d'attesa</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-body-sm mb-4" style={{ color: '#FDFAF5' }}>Soci</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/auth/signup" className="transition-colors hover:text-white">Entra nel Club</Link></li>
              <li><Link to="/auth/login" className="transition-colors hover:text-white">Accedi</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-body-sm mb-4" style={{ color: '#FDFAF5' }}>Proprietari</h4>
            <ul className="space-y-2 text-body-sm">
              <li><Link to="/auth/signup" className="transition-colors hover:text-white">Apri le porte al Club</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6" style={{ borderTop: '1px solid rgba(196,136,47,0.2)' }}>
          <p className="text-caption">© 2026 One Key to Everywhere · Puglia, Italia</p>
          <div className="flex gap-4 text-caption">
            <a href="#" className="transition-colors hover:text-white">Privacy</a>
            <a href="#" className="transition-colors hover:text-white">Termini</a>
            <a href="#" className="transition-colors hover:text-white">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
