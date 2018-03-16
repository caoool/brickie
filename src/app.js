import 'babel-polyfill'
import Trader from './Trader'

const exchanges = ['quoinex', 'bitflyer', 'zaif']
const trader = new Trader(exchanges)

const run = async () => {
  const gaps = await trader.fetchGaps()
}

run()