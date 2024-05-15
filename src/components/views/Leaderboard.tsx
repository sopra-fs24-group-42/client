import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Leaderboard.scss";
import BaseContainer from "components/ui/BaseContainer";
import { Table } from "@mantine/core";
import { Spinner } from "components/ui/Spinner";


const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardTable, setLeaderboardTable] = useState(null);
  const [noPlayers, setNoPlayers] = useState(false);
  const maxNumberOfTopPlayers = 5;

  const doGetTopPlayers = async () => {
    try {
      const response = await api.get(`/leaderboards/${maxNumberOfTopPlayers}`);
      console.log("response data" + response.data)
      setLeaderboardTable(response.data);
    } catch (error) {
      setNoPlayers(true);
      alert(
        `Something went wrong during opening the leaderboard: \n${handleError(error)}`
      );
    }
  };

  useEffect(() => {
    console.log(`LeaderboardTable" + ${leaderboardTable}`);
  }, [leaderboardTable]);

  useEffect(() => {
    doGetTopPlayers();
  }, []);

  let content = <Spinner />;

  if (leaderboardTable) {

    if (noPlayers) {
      content = <h3 className="leaderboard h3">No players have played this game so far.</h3>;
    } else {
      const rows = leaderboardTable.map((player) => (
        <Table.Tr key={player.username}>
          <Table.Td className="leaderboard table-header-position">{player.position}</Table.Td>
          <Table.Td className="leaderboard table-header-player">{player.username.slice(0, -5)}</Table.Td>
          <Table.Td className="leaderboard table-header-werewolves-wins">{player.numberOfWerewolfWins}</Table.Td>
          <Table.Td className="leaderboard table-header-villagers-wins">{player.numberOfVillagerWins}</Table.Td>
          <Table.Td className="leaderboard table-header-total-wins">{player.numberOfWins}</Table.Td>
        </Table.Tr>
      ));
      content = (
        <Table.ScrollContainer minWidth={500}>
          <Table className="leaderboard table" horizontalSpacing="xl">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="leaderboard table-header-position">#</Table.Th>
                <Table.Th className="leaderboard table-header-player">Player</Table.Th>
                <Table.Th className="leaderboard table-header-werewolves-wins">🐺 Wins </Table.Th>
                <Table.Th className="leaderboard table-header-villagers-wins">🧑‍🌾👩‍ Wins </Table.Th>
                <Table.Th className="leaderboard table-header-total-wins">Total Wins</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )
    }
  }
  
  return (
    <BaseContainer>
      <div className="leaderboard background-container">
        <div className="leaderboard header">Game Leaderboard</div>
        <div className="leaderboard container">
          {content}
          <div className="leaderboard button-container">
            <Button
              width="100%"
              height="40px"
              onClick={() => navigate("/frontpage")}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Leaderboard;