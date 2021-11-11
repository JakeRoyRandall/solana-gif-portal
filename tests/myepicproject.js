const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Myepicproject;
	
  const baseAccount = anchor.web3.Keypair.generate();

  let tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  console.log("📝 Your transaction signature", tx);

  await program.rpc.addGif("https://media4.giphy.com/media/cFiwlqJ2XDttLKlAwa/giphy.gif?cid=ecf05e479acv5uzokwpl0qbg883aigvnk2vfkh2pl3si6748&rid=giphy.gif&ct=g", {
    accounts: {
      baseAccount: baseAccount.publicKey,
    },
  });
  
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString())
  console.log('👀 GIF List', account.gifList)

}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();