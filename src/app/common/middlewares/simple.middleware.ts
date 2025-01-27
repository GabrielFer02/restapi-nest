// export class SimpleMiddleware implements NestMiddleware {
// use(req: Request, res: Response, next: NextFunction) {
//   const authoziration = req.headers?.authorization;
// if (authoziration) {
//   req['user'] = {
//     name: 'Gabriel',
//     lastName: 'Fernando',
//   };
// }
// res.setHeader('CABECALHO', 'Do Middleware');
// // return res.status(404).send({
// //   message: 'Não encontrado',
// // });
// next();
// console.log('Tchau');
// res.on('finish', () => console.log('acabou aqui'));
// }
// }
