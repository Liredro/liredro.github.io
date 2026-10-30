import { quotes } from '../data/ticker.js';

function TapeSet() {
  return <div className="tape__set">
    {quotes.map(([symbol, percentage, rising]) => <div className="quote" key={symbol}>
      <span className="quote__symbol">{symbol}</span>
      <span className={`quote__change${rising ? '' : ' quote__change--down'}`}>{rising ? '▲' : '▼'} {percentage}</span>
      <span className="quote__sep">✳</span>
    </div>)}
  </div>;
}

export default function Ticker() {
  return <div className="tape" role="region" aria-label="Decorative stock ticker. Sample symbols and movements, not live market data.">
    <div className="tape__badge"><span className="tape__dot" aria-hidden="true"/>THE TAPE</div>
    <div className="tape__window"><div className="tape__track" aria-hidden="true"><TapeSet/><TapeSet/></div></div>
  </div>;
}
