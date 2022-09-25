import { definePlugin } from "../naoko/Plugin";
import { defineCommand } from "../types";
import { getUserProfilePicture } from "../logic/logic";

export default definePlugin({
  name: "@geoxor/avatar",
  version: "1.0.0",
  command: defineCommand({
    name: "avatar",
    category: "UTILITY",

    usage: "avatar <@user | user_id>",
    description: "Get the avatar of a user or yours",

    execute: (message) => getUserProfilePicture(message),
  }),
});
