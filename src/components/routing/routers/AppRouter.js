import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {GameGuard} from "../routeProtectors/GameGuard";
import GameRouter from "./GameRouter";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import FrontPage from "../../views/FrontPage";
import CreateGame from "../../views/CreateGame";
import JoinGame from "../../views/JoinGame";
import WaitingRoom from "../../views/WaitingRoom";
import RoleReveal from "../../views/RoleReveal";
import NightAction from "../../views/NightAction";
import NightReveal from "../../views/NightReveal";
import VotingReveal from "../../views/VotingReveal";
import Discussion from "../../views/Discussion";
import Voting from "../../views/Voting";
import NarrationPhase from "../../views/NarrationPhase";


/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reactrouter.com/en/main/start/tutorial 
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/frontpage" replace />} />
        <Route path="/frontpage" element={<FrontPage />} />
        <Route path="/creategame" element={<CreateGame />} />
        <Route path="/joingame" element={<JoinGame />} />
        <Route path="/waitingroom" element={<WaitingRoom />} />
        <Route path="/rolereveal" element={<RoleReveal />} />
        <Route path="/nightaction" element={<NightAction />} />
        <Route path="/nightreveal" element={<NightReveal />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/votingreveal" element={<VotingReveal />} />
        <Route path="/NarrationPhase" element={<NarrationPhase />} />
        </Route>
        <Route path="/game/*" element={<GameGuard><GameRouter /></GameGuard>} />

      </Routes>
    </BrowserRouter>
  );
};

//TO INCLUDE A GUARD, THIS IS THE NOTATION: 
// <Route path="/frontpage" element={<LoginGuard><FrontPage /></LoginGuard>} />

/*<Route path="/frontpage/*" element={<GameGuard />}>
          <Route path="/frontpage/*" element={<GameRouter base="/game"/>} />
        </Route>

        <Route path="/frontpage" element={<LoginGuard />}>
          <Route path="/frontpage" element={<FrontPage />} />
        </Route>

        <Route path="/creategame" element={<LoginGuard />}>
          <Route path="/creategame" element={<CreateGame />} />
        </Route>

        <Route path="/joingame" element={<LoginGuard />}>
          <Route path="/joingame" element={<JoinGame />} />
        </Route>

        <Route path="/waitingroom" element={<LoginGuard />}>
          <Route path="/waitingroom" element={<WaitingRoom />} />
        </Route>

        <Route path="/rolereveal" element={<LoginGuard />}>
          <Route path="/rolereveal" element={<RoleReveal />} />
        </Route>

        <Route path="/" element={
          <Navigate to="/frontpage" replace />
        }/>

      </Routes>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
