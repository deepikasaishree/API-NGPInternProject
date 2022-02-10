/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import ClustersController from '../app/Controllers/ClustersController'

// Route.get('/', async () => {
//   return { message: 'Welcome to the Microservice t05 cluster' }
// })

Route.get('/', ClustersController.getData).middleware(['auth'])
Route.get('/replicas', ClustersController.getReplicasData).middleware(['auth'])
Route.get('/replica_status', ClustersController.getReplicasStatus).middleware(['auth'])
Route.get('/count', ClustersController.getActiveCount).middleware(['auth'])

Route.any('*', async ({ response }) => {
    return response.status(404).send('INVALID_ROUTE')
})