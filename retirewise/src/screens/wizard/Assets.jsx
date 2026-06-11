import { useStore } from '../../store/useStore.js'
import { fmtMoney } from '../../data/countries.js'
import { WizardShell } from '../../components/Layout.jsx'
import { Card, Field, NumberInput } from '../../components/ui.jsx'

const ASSET_CARDS = [
  { key: 'cash', icon: '💰', label: 'Cash & savings', hint: 'Bank accounts, savings accounts, fixed deposits' },
  { key: 'investments', icon: '📈', label: 'Investments', hint: 'Stocks, funds, ISAs, brokerage accounts' },
  { key: 'property', icon: '🏠', label: 'Property equity', hint: 'Home value minus mortgage (not used for income)' },
  { key: 'liabilities', icon: '💳', label: 'Debts & loans', hint: 'Mortgages, personal loans, credit cards' },
]

export default function Assets() {
  const { assets, setAssets, profile } = useStore()
  const netWorth = assets.cash + assets.investments + assets.property - assets.liabilities
  const symbol = fmtMoney(0, profile.country).replace(/[\d.,\s]/g, '')

  return (
    <WizardShell title="What do you own — and owe?" subtitle="Pensions come next; here we capture everything else.">
      <div className="grid gap-6 md:grid-cols-2">
        {ASSET_CARDS.map(({ key, icon, label, hint }) => (
          <Card key={key}>
            <Field label={`${icon} ${label}`} hint={hint}>
              <NumberInput value={assets[key]} onChange={(v) => setAssets({ [key]: v })} prefix={symbol} step={1000} min={0} />
            </Field>
          </Card>
        ))}
      </div>
      <Card className="mt-6 flex items-center justify-between bg-slate-900 !text-white">
        <span className="font-semibold">Net worth (excl. pensions)</span>
        <span className="text-2xl font-extrabold">{fmtMoney(netWorth, profile.country)}</span>
      </Card>
    </WizardShell>
  )
}
