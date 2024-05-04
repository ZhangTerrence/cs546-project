import database from "../src/config/database.js";
import UserService from "../src/services/user.service.js";
import ServerService from "../src/services/server.service.js";
import PrivateMessageService from "../src/services/privateMessage.service.js";
import ChannelService from "../src/services/channel.service.js";

async function main() {
  const connection = await database();
  await connection.connection.dropDatabase();

  try {
    // Creates users
    const userA = await UserService.createUser(
      "userA@gmail.com",
      "UserA",
      "@Password123"
    );
    const userB = await UserService.createUser(
      "userB@gmail.com",
      "UserB",
      "@Password123"
    );
    const userC = await UserService.createUser(
      "userC@gmail.com",
      "UserC",
      "@Password123"
    );
    const userD = await UserService.createUser(
      "userD@gmail.com",
      "UserD",
      "@Password123"
    );

    // Creates servers
    const serverA = await ServerService.createServer(
      "ServerA",
      "ServerA description.",
      userA.id
    );
    const serverB = await ServerService.createServer(
      "ServerB",
      "ServerB description.",
      userB.id
    );

    // Creates channels
    const serverAChannel = await ChannelService.createChannel(
      "general",
      "general description.",
      serverA,
      0,
      userA
    );
    await ServerService.addChannel(serverA, serverAChannel);
    const serverAChannel2 = await ChannelService.createChannel(
      "general2",
      "general2 description.",
      serverA,
      5,
      userA
    );
    await ServerService.addChannel(serverA, serverAChannel2);
    const serverBChannel = await ChannelService.createChannel(
      "general",
      "general description.",
      serverB,
      0,
      userB
    );
    await ServerService.addChannel(serverB, serverBChannel);
    const serverBChannel2 = await ChannelService.createChannel(
      "general2",
      "general2 description.",
      serverB,
      2,
      userB
    );
    await ServerService.addChannel(serverB, serverBChannel2);

    // Joins servers
    await UserService.addServer(userA, serverA);
    await ServerService.addUser(serverA, userC);
    await UserService.addServer(userC, serverA);

    await UserService.addServer(userB, serverB);
    await ServerService.addUser(serverB, userD);
    await UserService.addServer(userD, serverB);

    // Friends users and creates private messages
    await UserService.sendFriendRequest(userA, userD);
    await UserService.sendFriendRequest(userD, userA);
    await UserService.acceptFriendRequest(userA, userD);
    await PrivateMessageService.createPrivateMessage(userA, userD);

    await UserService.sendFriendRequest(userB, userC);
    await UserService.sendFriendRequest(userC, userB);
    await UserService.acceptFriendRequest(userB, userC);
    await PrivateMessageService.createPrivateMessage(userB, userC);
  } catch (error) {
    console.log(error);
    await connection.disconnect();
    process.exit(1);
  }

  console.log("Successfully seeded database.");
  await connection.disconnect();
  process.exit(0);
}

main();
