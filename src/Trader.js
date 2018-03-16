import ccxt from 'ccxt'
import { _ } from 'underscore'
import { sleep } from './helpers'

export default class Trader {
  constructor(exchanges, currency='BTC/JPY', cash=30000, coin=0.01) {
    this.currency = currency
    this.exchanges = exchanges.map((exchange) => {
      return new ccxt[exchange]()
    })
    this.cash = cash
    this.coin = coin
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
    for (const [i, seller] of tickers.entries()) {
      for (const [j, buyer] of tickers.entries()) {
        if (i == j) { continue }
        let gap = { 
          seller: seller.id,
          buyer: buyer.id,
          gap: seller.ask - buyer.bid
        }
        gaps.push(gap)
      }
    }
    return gaps
  }

  // fetchGap is used to simulator real time gap change after average transaction time
  async fetchGap(sellerExchange, buyerExchange) {
    const seller = await this.fetchTicker(new ccxt[sellerExchange]())
    const buyer = await this.fetchTicker(new ccxt[buyerExchange]())
    const gap = seller.ask - buyer.bid
    return {
      seller: sellerExchange.id,
      buyer: buyerExchange.id,
      gap: gap
    }
  }

  async tradeSimulator() {
    const gaps = await this.fetchGaps()
    const maxGap = _.max(gaps, _.property('gap'))
    // average transaction time is 12.5 mins
    await sleep(100000)
    const currentGap = await this.fetchGap(maxGap.seller, maxGap.buyer)
    this.cash += currentGap.gap
    console.log(`Sell coin ${currentGap.seller}, Buy coin from ${currentGap.buyer}, Actual Gain ${currentGap.gap}, Expected Gain ${maxGap.gap}, current cash ${this.cash}`)
  }

  async autoTradeSimulator() {
    while(1) {
      await this.tradeSimulator()
    }
  }
}