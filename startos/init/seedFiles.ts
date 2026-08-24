import { paymentNameJson } from '../file-models/payment-name.json'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  await paymentNameJson.merge(effects, {})
})
