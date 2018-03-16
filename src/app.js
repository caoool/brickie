import 'babel-polyfill'
import Trader from './Trader'

const exchanges = ['quoinex', 'bitflyer', 'zaif']
const trader = new Trader(exchanges)

trader.autoTradeSimulator()
