import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon, HomeModernIcon, UserPlusIcon, SparklesIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const MEMBER_STEPS = [
  {
    icon: <UserPlusIcon className="w-6 h-6" />,
    title: 'Fai richiesta e vieni accettato',
    desc: 'Il Club è selettivo. Compili un profilo, ci presenti la tua storia e aspetti il via libera. Non si entra per caso — e questo è il punto.',
  },
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'Ricevi le tue chiavi',
    desc: 'Con la membership ricevi un pacchetto di chiavi. Le chiavi sono il tuo credito all\'interno del Club. Non scadono. Non cambiano valore tra agosto e febbraio.',
  },
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Accedi a qualsiasi casa del Club',
    desc: 'Scegli la casa. Usa le tue chiavi per accedervi. Non esiste un "prezzo" stagionale — ogni casa richiede un numero fisso di chiavi per notte. Meno chiavi in inverno, le stesse in estate.',
  },
  {
    icon: <SparklesIcon className="w-6 h-6" />,
    title: 'Porta con te chi ami',
    desc: 'Aggiungi familiari o persone care al tuo nucleo e condividi le chiavi. Ognuno può accedere alle case del Club in modo autonomo.',
  },
]

const OWNER_STEPS = [
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Apri le porte al Club',
    desc: 'Non metti casa "su una piattaforma". La proponi al Club. Il processo è guidato e curioso: vogliamo sapere la storia della casa, non solo le foto.',
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Passa la selezione',
    desc: 'Il nostro team visiona ogni proposta. Non tutte vengono accettate — e chi viene accettato lo sa: la sua casa è in buona compagnia.',
  },
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'Guadagna chiavi',
    desc: 'Ogni volta che un socio accede alla tua casa, guadagni chiavi. Puoi usarle per accedere alle case degli altri membri. Il Club si nutre di questa reciprocità.',
  },
  {
    icon: <ArrowPathIcon className="w-6 h-6" />,
    title: 'Gestisci in totale autonomia',
    desc: 'Blocchi le date che vuoi. Aggiorna le informazioni quando cambia qualcosa. Il Club non ti detta i termini: sei tu il custode della tua casa.',
  },
]

const FAQS = [
  {
    q: 'Le chiavi scadono?',
    a: 'No. Le chiavi che ricevi con la membership sono tue. Non c\'è data di scadenza, non c\'è penale per chi non viaggia ogni mese. Puoi aspettare il momento giusto.',
  },
  {
    q: 'Quanto costano le chiavi per accedere a una casa?',
    a: 'Ogni casa del Club ha un numero fisso di chiavi per notte — stabilito dal proprietario in accordo con noi. Non esistono rincari stagionali: il valore di una chiave è lo stesso in alta e bassa stagione.',
  },
  {
    q: 'Posso condividere le mie chiavi con la famiglia?',
    a: 'Sì. Crei un nucleo familiare e inviti chi vuoi. Il saldo di chiavi è condiviso e ogni membro del nucleo può accedere alle case in modo indipendente.',
  },
  {
    q: 'Come funziona il rimborso se non posso più andare?',
    a: 'Puoi disdire con rimborso completo delle chiavi fino a 48 ore prima dell\'accesso. Dopo le 48 ore si applica un rimborso parziale.',
  },
  {
    q: 'Il Club è solo per la Puglia?',
    a: 'Per ora sì — e lo diciamo con orgoglio. Prima di espanderci vogliamo fare una cosa sola nel modo migliore possibile. La Puglia è il cuore del Club.',
  },
  {
    q: 'Come mai i prezzi non cambiano tra estate e inverno?',
    a: 'Perché crediamo che la Puglia sia bellissima tutto l\'anno e che i proprietari meritino di accogliere ospiti anche in bassa stagione. Il modello a chiavi elimina l\'incentivo opportunistico del prezzo dinamico.',
  },
  {
    q: 'Sono un proprietario. Devo essere anche membro?',
    a: 'Sì. Tutti i proprietari sono soci del Club. Non c\'è distinzione tra chi ospita e chi viene ospitato — tutti fanno parte dello stesso cerchio.',
  },
]

export function HowItWorksPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FDFAF5' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ background: '#F7F0E3', borderBottom: '1px solid #E8DCCF' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>Come funziona</p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#2C1810' }}>
            Non una piattaforma.<br />Un Club.
          </h1>
          <p className="text-body-lg" style={{ color: '#8A7560' }}>
            Capisci la differenza e non torni più indietro.
          </p>
        </div>
      </section>

      {/* For members */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#C4882F' }}>Per i soci</span>
          <h2 className="font-display text-heading-xl font-bold mt-2" style={{ color: '#2C1810' }}>Accedi. Non prenotare.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {MEMBER_STEPS.map(({ icon, title, desc }, i) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#8B3A2A', color: '#FDFAF5' }}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption font-bold" style={{ color: '#C4882F' }}>0{i + 1}</span>
                </div>
                <h3 className="text-body-md font-semibold mb-1" style={{ color: '#2C1810' }}>{title}</h3>
                <p className="text-body-sm" style={{ color: '#8A7560' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* For owners */}
      <section style={{ background: '#F5F7F0', borderTop: '1px solid #CDD8B0' }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-caption font-semibold uppercase tracking-widest" style={{ color: '#4A5C28' }}>Per i proprietari</span>
            <h2 className="font-display text-heading-xl font-bold mt-2" style={{ color: '#2C1810' }}>Sei un socio. Anche tu.</h2>
            <p className="text-body-md mt-3 max-w-xl mx-auto" style={{ color: '#637A38' }}>
              Non sei un "host". Non "affitti". Fai parte del Club esattamente come gli altri membri — e la tua casa è la tua quota.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {OWNER_STEPS.map(({ icon, title, desc }, i) => (
              <div key={title} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#4A5C28', color: '#FDFAF5' }}>
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption font-bold" style={{ color: '#637A38' }}>0{i + 1}</span>
                  </div>
                  <h3 className="text-body-md font-semibold mb-1" style={{ color: '#2C1810' }}>{title}</h3>
                  <p className="text-body-sm" style={{ color: '#8A7560' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key currency explainer */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#2C1810' }}>
          Le chiavi, spiegate in tre righe.
        </h2>
        <div className="space-y-4">
          {[
            { n: '1', text: 'Con la membership ricevi un numero di chiavi. Sono tue, non scadono.' },
            { n: '2', text: 'Ogni casa del Club ha un costo fisso in chiavi per notte. Scegli la casa, usi le tue chiavi per accedervi.' },
            { n: '3', text: 'Se possiedi una casa e la metti nel Club, guadagni chiavi ogni volta che un socio vi accede. Usi quelle chiavi per accedere ad altre case.' },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-4 p-5 rounded-card text-left" style={{ background: '#F7F0E3', border: '1px solid #E8DCCF' }}>
              <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold" style={{ background: '#8B3A2A', color: '#FDFAF5' }}>{n}</span>
              <p className="text-body-sm" style={{ color: '#2C1810' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: '#F7F0E3', borderTop: '1px solid #E8DCCF' }} className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold text-center mb-10" style={{ color: '#2C1810' }}>Domande frequenti</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-xl" style={{ border: '1px solid #E8DCCF', background: '#FDFAF5' }}>
                <h3 className="text-body-md font-semibold mb-2" style={{ color: '#2C1810' }}>{q}</h3>
                <p className="text-body-sm" style={{ color: '#8A7560' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: '#2C1810' }}>
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-display text-heading-xl font-bold mb-6" style={{ color: '#FDFAF5' }}>Pronti a far parte del Club?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              style={{ background: '#C4882F', color: '#2C1810', border: 'none', fontWeight: 700 }}
            >
              Richiedi la membership
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/pricing')}
              style={{ borderColor: '#8A7560', color: '#C4A882' }}
            >
              Vedi i piani
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
