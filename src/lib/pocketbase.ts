import PocketBase from 'pocketbase'

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://158.247.210.200:8090')

export default pb
