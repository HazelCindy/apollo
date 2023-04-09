/* eslint-disable no-promise-executor-return */
const Koa = require("koa");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { ApolloServer } = require("apollo-server-koa");
const http = require("http");
const session = require("koa-session");
const helmet = require("koa-helmet");
const logger = require("koa-logger");
const { userAgent } = require("koa-useragent");
const requestIp = require("request-ip");
const config = require("dotenv");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const Logger = require("./utils/logging");

config.config();
const configValues = process.env;
// this represents a maxage of three months
const configurations =
  configValues.NODE_ENV === "production"
    ? require("../configs/production.json")
    : require("../configs/development.json");

const CountriesAPI = require("./datasources/Countries");
const NameAPI = require("./datasources/Name");

async function startApolloServer(typeDefsParam, resolversParam) {
  const httpServer = http.createServer();
  const server = new ApolloServer({
    typeDefs: typeDefsParam,
    resolvers: resolversParam,
    context: ({ ctx }) => {
      const clientIp = requestIp.getClientIp(ctx.req);
      return {
        session: ctx.req.session,
        cookie: ctx.cookie,
        userAgent: ctx.userAgent,
        clientIp,
      };
    },
    dataSources: () => ({
      country: new CountriesAPI(),
      name: new NameAPI(),
    }),
    formatError: (err) => {
      err.extensions.exception = "";
      if (
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
          err.message
        )
      ) {
        err.message =
          "Oops! An error occurred somewhere. Please try again later.";
      }
      return err;
    },
    persistedQueries: false,
    introspection: configValues.NODE_ENV !== "production",
    playground: configValues.NODE_ENV !== "production",
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  const app = new Koa();

  app.use(logger());

  // use random keys to sign the data
  app.keys = configurations.session.keys;

  const whitelist = configValues.ORIGIN.split(",");

  const checkOriginAgainstWhitelist = (ctx) => {
    const requestOrigin = ctx.request.header.origin;
    if (!whitelist.includes(requestOrigin)) {
      return whitelist[0];
    }
    return requestOrigin;
  };

  app.use(userAgent);

  app.use(
    helmet({
      contentSecurityPolicy:
        configValues.NODE_ENV === "production" ? undefined : false,
    })
  );
  // add the ecnryption secret key
  // configurations.session.options.secretKey = Buffer.from(configValues.COOKIE_ENCRYPTION_KEY, 'base64');
  app.use(session(configurations.session.options, app));

  app.use((ctx, next) => {
    try {
      // copy session to native Node's req object because GraphQL execution context doesn't have access to Koa's
      // context, see https://github.com/apollographql/apollo-server/issues/1551
      ctx.cookie = ctx.cookies;
      ctx.req.session = ctx.session;
      return next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit("error", err, ctx);
      return null;
    }
  });

  app.on("error", (err, ctx) => {
    /* centralized error handling:
     *   console.log error
     *   write error to log file
     *   save error and request information to database if ctx.request match condition
     *   ...
     */
    Logger.log("error", "Error: ", {
      fullError: err,
      customError: err.message,
      systemError: "",
      actualError: err.message,
      customerMessage:
        "Sorry we are experiencing a technical problem. Please try again later.",
    });
    ctx.status = err.status;
    ctx.body = err.message;
  });

  server.applyMiddleware({
    app,
    cors: {
      origin: checkOriginAgainstWhitelist,
      credentials: true,
    },
  });

  httpServer.on("request", app.callback());
  await new Promise((resolve) =>
    httpServer.listen({ port: configValues.SERVER_PORT || 4000 }, resolve)
  );
  // eslint-disable-next-line no-console
  console.log(
    `🚀 Server ready at http://localhost:${configValues.SERVER_PORT || 4000}${
      server.graphqlPath
    }`
  );
  return { server, app };
}

startApolloServer(typeDefs, resolvers);

module.exports = http;
