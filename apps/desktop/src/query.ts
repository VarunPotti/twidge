import { QueryClient } from "@tanstack/react-query";
import { createClient } from "@rspc/client";
import { createReactQueryHooks } from "@rspc/react";

import type { Procedures } from "./bindings"; // These were the bindings exported from your Rust code!
import { TauriTransport } from "@rspc/tauri";

// You must provide the generated types as a generic and create a transport (in this example we are using HTTP Fetch) so that the client knows how to communicate with your API.
const client = createClient<Procedures>({
	// Refer to the integration your using for the correct transport.
	transport: new TauriTransport(),
});

const queryClient = new QueryClient();
const rspc = createReactQueryHooks<Procedures>();

export default rspc;
export { client, queryClient };
