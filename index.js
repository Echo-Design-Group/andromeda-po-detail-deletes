process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const { connectDb, executeProcedure } = require('./sql');
const { andromedaAuthorization } = require('./authorization.js');
const { sendErrorEmail } = require('./functions/errorReporting.js');

const { getCurrentPODetailIds, deletePODetails } = require('./andromeda');

const main = async () => {
  console.log('Andromeda PO Detail Deletes is running...');
  const errors = [];
  try {
    // Connect to Andromeda and to SQL Server
    await andromedaAuthorization();
    console.log('Authorization complete');
    await connectDb();

    // Get the ids of all details currently in Andromeda
    const andromedaIds = await getCurrentPODetailIds();

    // Delete any ids that are not in Andromeda, but are in our Andromeda DB's
    const deleteErrors = await deletePODetails(andromedaIds);
    deleteErrors && errors.push(deleteErrors);

    // After detail rows have been deleted, send the production orders to ECHO-INT
    await executeProcedure('ProductionOrderExportToEHOINT'); 
  } catch (err) {
    errors.push({
      err: err?.message,
    });
    await sendErrorEmail(errors.flat());
    process.kill(process.pid, 'SIGTERM');
  }

  if (errors.flat().length) {
    await sendErrorEmail(errors.flat());
  }

  process.kill(process.pid, 'SIGTERM');
};

main()

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});

// Register an unhandled exception handler
process.on('uncaughtException', async (err) => {
  // Exit the application with an error code
  process.exit(1);
});

// Register an unhandled exception handler
process.on('unhandledRejection', async (err) => {
  // Exit the application with an error code
  process.exit(1);
});
