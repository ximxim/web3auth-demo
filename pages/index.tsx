import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES, ADAPTER_EVENTS } from "@web3auth/base";
import { SolanaWallet } from "@web3auth/solana-provider";

import { useState, useEffect, useMemo } from "react";
import type { NextPage } from "next";
import {
  Heading,
  Text,
  Button,
  Flex,
  List,
  ListIcon,
  ListItem,
  Tooltip,
} from "@chakra-ui/react";
import {
  ArrowForwardIcon,
  CheckCircleIcon,
  InfoIcon,
  LockIcon,
  WarningIcon,
} from "@chakra-ui/icons";

import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [solanaAddress, setSolanaAddress] = useState<string>("");
  const [solanaPrivateKey, setSolanaPrivateKey] = useState<string>("");
  const [loading, setLoading] = useState<string>("Getting Things Ready");
  const [events, setEvents] = useState<any[]>([]);
  const solanaWeb3Auth = useMemo(() => {
    const instance = new Web3Auth({
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.SOLANA,
        chainId: "0x1",
        rpcTarget: `https://rpc.ankr.com/solana`,
        displayName: "solana",
        ticker: "SOL",
        tickerName: "solana",
      },
      clientId:
        "BGMOGdOE0jxkAZyVdOV7kpZ0S37z-lgxDj0eHuyh7dOjR97FPmcXykgPsBofc3acRi3znza6fMOLO6oVanOVtA8",
    });
    instance.on(ADAPTER_EVENTS.NOT_READY, (params) => {
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: NOT_READY",
          params,
          as: WarningIcon,
          color: "yellow.500",
        })
      );
    });
    instance.on(ADAPTER_EVENTS.ADAPTER_DATA_UPDATED, (params) => {
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: ADAPTER_DATA_UPDATED",
          params,
          as: InfoIcon,
          color: "blue.500",
        })
      );
    });
    instance.on(ADAPTER_EVENTS.READY, (params) => {
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: READY",
          params,
          as: CheckCircleIcon,
          color: "green.500",
        })
      );
    });
    instance.on(ADAPTER_EVENTS.CONNECTING, (params) => {
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: CONNECTING",
          params,
          as: InfoIcon,
          color: "blue.500",
        })
      );
    });
    instance.on(ADAPTER_EVENTS.DISCONNECTED, (params) => {
      setSolanaAddress("");
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: DISCONNECTED",
          params,
          as: LockIcon,
          color: "red.500",
        })
      );
    });
    instance.on(ADAPTER_EVENTS.ERRORED, (params) => {
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: ERRORED",
          params,
          as: InfoIcon,
          color: "red.500",
        })
      );
    });
    instance.on(ADAPTER_EVENTS.CONNECTED, async (params) => {
      const solanaWallet = new SolanaWallet(instance.provider!);
      const wallets = await solanaWallet.requestAccounts();

      if (params.adapter === 'openlogin') {
        const privateKey = await solanaWallet.request({
          method: "solanaPrivateKey",
          params: {},
        });
  
        setSolanaPrivateKey(privateKey as string);
      }

      setSolanaAddress(wallets[0]);

      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth: CONNECTED",
          params: { ...params, wallets },
          as: CheckCircleIcon,
          color: "green.500",
        })
      );
    });

    return instance;
  }, []);

  useEffect(() => {
    (async () => {
      await solanaWeb3Auth.initModal();
      setLoading("");
      setEvents((prevState) =>
        prevState.concat({
          name: "solanaWeb3Auth Modal Ready",
          params: { isReady: true },
          as: CheckCircleIcon,
          color: "green.500",
        })
      );
    })();
  }, [solanaWeb3Auth]);

  return (
    <Flex
      alignItems="center"
      flexDirection="column"
      gap={4}
      height="100vh"
      justifyContent="center"
    >
      <Flex
        borderColor="black"
        borderWidth={1}
        flexDirection="column"
        minHeight="xs"
        maxHeight="xs"
        maxWidth="xs"
        minWidth="xs"
        overflow="scroll"
        p={3}
      >
        <List>
          {events.map(({ name, params, ...icon }) => (
            <Tooltip label={JSON.stringify(params)} key={name}>
              <ListItem>
                <ListIcon {...icon} />
                {name}
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Flex>
      <Flex gap={4}>
        {solanaAddress ? (
          <Flex direction="column" justify="center" align="center">
            <Heading>Solana Wallet Address</Heading>
            <Text>{solanaAddress}</Text>
            {solanaPrivateKey ? (
              <>
                <Heading>Solana Private Key</Heading>
                <Text>{solanaPrivateKey}</Text>
              </>
            ) : null}
            <Button
              onClick={() => {
                solanaWeb3Auth.logout();
              }}
            >
              Disconnect Solana Wallet
            </Button>
          </Flex>
        ) : (
          <Button
            isLoading={!!loading}
            loadingText={loading}
            onClick={() => {
              solanaWeb3Auth.connect();
            }}
          >
            Connect To Solana Wallet
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default Home;
