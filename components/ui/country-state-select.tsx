import React from 'react'

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
]

type Props = {
  country: string
  state?: string
  onCountryChange?: (value: string) => void
  onStateChange?: (value: string) => void
  required?: boolean
}

export const CountryStateSelect: React.FC<Props> = ({ country, state, onCountryChange, onStateChange, required }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</label>
        <select value={country} onChange={(e) => onCountryChange && onCountryChange(e.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" required={required}>
          <option>United States</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</label>
        <select value={state ?? ''} onChange={(e) => onStateChange && onStateChange(e.target.value)} className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" required={required}>
          <option value="">Select state</option>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}

export default CountryStateSelect
