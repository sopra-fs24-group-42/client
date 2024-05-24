import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Leaderboard.scss";
import BaseContainer from "components/ui/BaseContainer";
import { Table, Popover } from "@mantine/core";
import "styles/views/JoinGame.scss";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardTable, setLeaderboardTable] = useState(null);
  const [noPlayers, setNoPlayers] = useState(false);
  const maxNumberOfTopPlayers = 25;
  const [popoverNoGamePlayed, setpopoverNoGamePlayed] = useState(false);

  const doGetTopPlayers = async () => {
    try {
      const response = await api.get(`/leaderboards/${maxNumberOfTopPlayers}`);
      setLeaderboardTable(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setpopoverNoGamePlayed(true);
        setNoPlayers(true);
      }
      else {
        alert(
          `Something went wrong during opening the leaderboard: \n${handleError(error)}`
        );
      }
    }
  };

  useEffect(() => {
    console.log(`LeaderboardTable" + ${leaderboardTable}`);
  }, [leaderboardTable]);

  useEffect(() => {
    doGetTopPlayers();
  }, []);

  let content = "";

  if (noPlayers === true) {
    content = (
      <div>
        <h3 className="leaderboard h3">No players have played this game so far.</h3>
      </div>
    )
  }


  if (leaderboardTable) {
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
      <div>
        <h4 className="leaderboard h4">Players with most wins:</h4>
        <Table.ScrollContainer minWidth={500}>
          <Table className="leaderboard table" horizontalSpacing="xl">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="leaderboard table-header-position">#</Table.Th>
                <Table.Th className="leaderboard table-header-player">Player</Table.Th>
                <Table.Th className="leaderboard table-header-werewolves-wins">🐺</Table.Th>
                <Table.Th className="leaderboard table-header-villagers-wins">🧑‍🌾👩‍</Table.Th>
                <Table.Th className="leaderboard table-header-total-wins">Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
    )
  }

  return (
    <div className="leaderboard total-background">
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
        {popoverNoGamePlayed && (
          <Popover
            opened={popoverNoGamePlayed}
            onClose={() => setpopoverNoGamePlayed(false)}
            withArrow
            shadow="md"
          >
            <Popover.Dropdown className="joinGame dropdown">
              <div className="joinGame popover-container">
                <div className="joinGame heading">No games have been played so far. Be the first one to do so!</div>
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => setpopoverNoGamePlayed(false)}
                >
                  ok
                </Button>
              </div>
            </Popover.Dropdown>
          </Popover>
        )}
      </BaseContainer>
    </div>
  );
};

export default Leaderboard;