import ccxt from 'ccxt'

export default class Trader {
  constructor(exchanges, currency='BTC/JPY') {
    this.currency = currency
    this.exchanges = exchanges.map((exchange) => {
      return new ccxt[exchange]()
    })
  }

  async fetchTicker(exchange) {
    let ticker = await exchange.fetchTicker(this.currency)
    ticker['id'] = exchange.id
    return ticker
  }

  async fetchTickers() {
    const tickers = await Promise.all(
      this.exchanges.map((exchange) => {
        return this.fetchTicker(exchange)
      })
    )
    return tickers
  }

  async fetchGaps() {
    const tickers = await this.fetchTickers()
    let gaps = []
    for (const [i, origin] of tickers.entries()) {
      let gap = { 
        from: origin.id,
        to: []
      }
      for (const [j, target] of tickers.entries()) {
        if (i == j) { continue }
        const to = {
          to: target.id,
          diff: origin.ask - target.bid
        }
        gap['to'].push(to)
      }
      gaps.push(gap)
    }
    return gaps
  }
}