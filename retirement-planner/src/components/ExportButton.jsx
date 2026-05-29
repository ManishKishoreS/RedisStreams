import { useStore } from '../store/useStore.js'
import { CURRENCY_SYMBOLS } from '../data/defaults.js'

function fmt(v, sym) {
  if (!v) return `${sym}0`
  if (v >= 1e7) return `${sym}${(v / 1e7).toFixed(2)}Cr`
  if (v >= 1e5) return `${sym}${(v / 1e5).toFixed(2)}L`
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(2)}M`
  return `${sym}${Math.round(v).toLocaleString()}`
}

export default function ExportButton() {
  const { results, profile, income, expenses } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.country] || '₹'

  const exportCSV = () => {
    if (!results) return
    const rows = [
      ['Retirement Planning Report'],
      ['Generated', new Date().toLocaleDateString()],
      [],
      ['SUMMARY'],
      ['Projected Corpus', Math.round(results.projectedCorpus)],
      ['Required Corpus', Math.round(results.requiredCorpus)],
      ['Surplus / Shortfall', Math.round(results.surplus)],
      ['Monte Carlo Success Rate', `${(results.monteCarlo?.successRate * 100 || 0).toFixed(1)}%`],
      ['Retirement Score', results.score],
      [],
      ['ACCUMULATION PHASE'],
      ['Age', 'Corpus', 'Annual Contribution', 'Growth'],
      ...(results.accumulation || []).map(r => [r.age, Math.round(r.corpus), Math.round(r.contribution), Math.round(r.growth)]),
      [],
      ['DECUMULATION PHASE'],
      ['Year', 'Corpus', 'Annual Withdrawal'],
      ...(results.decumulation || []).map(r => [r.year, Math.round(r.corpus), Math.round(r.withdrawal)]),
    ]

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'retirement-plan.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    if (!results) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Title
    doc.setFontSize(20)
    doc.setTextColor(79, 70, 229)
    doc.text('Retirement Planning Report', 20, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Country: ${profile.country}`, 20, 28)

    // Summary
    doc.setFontSize(14)
    doc.setTextColor(30, 30, 30)
    doc.text('Summary', 20, 42)

    const summaryData = [
      ['Metric', 'Value'],
      ['Current Age', profile.age],
      ['Retirement Age', profile.retirementAge],
      ['Life Expectancy', profile.lifeExpectancy],
      ['Monthly Salary', fmt(income.monthlySalary * 12, sym) + ' p.a.'],
      ['Monthly Expenses', fmt(expenses.monthlyExpenses * 12, sym) + ' p.a.'],
      ['Projected Corpus at Retirement', fmt(results.projectedCorpus, sym)],
      ['Required Corpus', fmt(results.requiredCorpus, sym)],
      ['Surplus / Shortfall', fmt(results.surplus, sym)],
      ['Monte Carlo Success Rate', `${(results.monteCarlo?.successRate * 100 || 0).toFixed(1)}%`],
      ['Retirement Score', `${results.score}/100`],
    ]

    let y = 50
    summaryData.forEach(([label, value], i) => {
      if (i === 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFillColor(230, 230, 250)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 255 : 255)
      }
      doc.rect(20, y, 170, 7, 'F')
      doc.setTextColor(30, 30, 30)
      doc.text(String(label), 22, y + 5)
      doc.text(String(value), 120, y + 5)
      y += 7
    })

    // Suggestions
    if (results.suggestions?.length > 0) {
      y += 8
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Actionable Suggestions', 20, y)
      y += 8
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      results.suggestions.forEach(s => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.setTextColor(60, 60, 60)
        doc.text(`• ${s}`, 22, y, { maxWidth: 166 })
        y += 10
      })
    }

    doc.save('retirement-plan.pdf')
  }

  return (
    <div className="flex gap-3">
      <button onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
        <span>📊</span> Export CSV
      </button>
      <button onClick={exportPDF}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
        <span>📄</span> Export PDF
      </button>
    </div>
  )
}
