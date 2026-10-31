#!/usr/bin/env node
import { Command } from "commander";

import { add } from "./commands/add";
import { build } from "./commands/build";
import { create } from "./commands/create";
import { init } from "./commands/init";
import { serve } from "./commands/serve";

const program = new Command()
  .name("shadcn-nsh")
  .description("Add styled NSH components (copy-into-app) from the shadcn-nsh registry")
  .version("0.0.0");

program.addCommand(create);
program.addCommand(build);
program.addCommand(init);
program.addCommand(add);
program.addCommand(serve);

program.parse();
