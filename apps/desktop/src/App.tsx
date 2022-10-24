import GlobalContext from "@twidge/utils/ctx";
import { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoadingPage from "./pages";
import HomePage from "./pages/home";
import rspc from "./query";
import { listen } from "@tauri-apps/api/event";
import LoginPage from "./pages/login";

function App() {
	const { globalStore } = useContext(GlobalContext);
	const navigate = useNavigate();
	const { isLoading } = rspc.useQuery(["misc.is_online"], {
		onSuccess: (data) => {
			if (data === undefined || data === false) {
				globalStore.setIsOnline(false);
			} else {
				globalStore.setIsOnline(true);
			}
		},
	});

	useEffect(() => {
		const loginUnlisten = listen("login", (e) => {
			const unique_id = e.payload;
			navigate(`/login?unique_id=${unique_id}`);
		});
		return () => {};
	}, []);

	return (
		<div className="w-screen h-screen bg-app-bg text-text-light">
			<Routes>
				<Route path="/" element={<LoadingPage />} />
				<Route path="/home" element={<HomePage globalStore={globalStore} />} />
				<Route path="/login" element={<LoginPage />} />
			</Routes>
		</div>
	);
}

export default App;
