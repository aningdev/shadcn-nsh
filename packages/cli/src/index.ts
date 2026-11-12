import { Command } from "commander";

import packageJson from "../package.json" with { type: "json" };
import { add } from "./commands/add";
import { build } from "./commands/build";
import { diff } from "./commands/diff";
import { init } from "./commands/init";
import { list } from "./commands/list";
import { serve } from "./commands/serve";
import { view } from "./commands/view";

const program = new Command()
  .name("shadcn-nsh")
  .description("Add styled NSH components (copy-into-app) from the shadcn-nsh registry")
  .version(packageJson.version);

program.addCommand(build);
program.addCommand(init);
program.addCommand(add);
program.addCommand(list);
program.addCommand(view);
program.addCommand(diff);
program.addCommand(serve);

program.parse();
