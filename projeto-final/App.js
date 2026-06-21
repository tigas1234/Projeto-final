import React, { useState, useEffect } from "react";
import {View, Text, TextInput, Button, FlatList, StyleSheet,} from "react-native";
import * as Location from "expo-location";
import * as SQLite from "expo-sqlite";
let db;

function ProdutoItem({ item, excluirProduto }) {
  return (
    <View style={styles.card}>
      <Text>Produto: {item.nome}</Text>
      <Text>Quantidade: {item.quantidade}</Text>
      <Text>Preço: R$ {item.preco}</Text>
      <Text>Latitude: {item.latitude}</Text>
      <Text>Longitude: {item.longitude}</Text>

      <Button
        title="Excluir"
        onPress={() => excluirProduto(item.id)}/></View>);}

export default function App() {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [produtos, setProdutos] = useState([]);



  useEffect(() => {
    iniciarBanco();}, []);
 async function iniciarBanco() {
  try {
  
    db = await SQLite.openDatabaseAsync("estoque.db");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        quantidade INTEGER,
        preco REAL,
        latitude REAL,
        longitude REAL);`);

    const resultado = await db.getAllAsync(
    "SELECT * FROM produtos");

    setProdutos(resultado);
  } catch (erro) {
    alert("ERRO BANCO: " + String(erro));
    console.log(erro);}}

  async function obterLocalizacao() {
    try{const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
      alert("Permissão negada");
        return;
      }
      const location =
        await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      alert("GPS capturado");
    } catch (erro) {
      alert("Erro GPS");
    }
  }
  async function salvarProduto() {
    try {
      if (!nome) {
        alert("Digite um produto");
        return;
      }
await db.runAsync(
  "INSERT INTO produtos (nome, quantidade, preco, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
  [
    nome,
    Number(quantidade || 0),
    Number(preco || 0),
    Number(latitude || 0),
    Number(longitude || 0)
  ]
);

      setNome("");
      setQuantidade("");
      setPreco("");
      await carregarProdutos();
      alert("Produto salvo");
  } catch (erro) {
  alert("ERRO: " + String(erro));
  console.log(erro);
}
  }
  async function carregarProdutos() {
    try {
      const resultado =
        await db.getAllAsync(
          "SELECT * FROM produtos"
        );

      setProdutos(resultado);
    } catch (erro) {
      console.log(erro);
    }
  }

  async function excluirProduto(id) {
    await db.runAsync(
      "DELETE FROM produtos WHERE id = ?",
      [id]
    );

    await carregarProdutos();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Controle de Estoque
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={preco}
        onChangeText={setPreco}
      />

      <Button
        title="Capturar GPS"
        onPress={obterLocalizacao}
      />

      <View style={{ marginTop: 10 }}>
        <Button
          title="Salvar Produto"
          onPress={salvarProduto}
        />
      </View>
      <FlatList
        data={produtos}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={({ item }) => (
          <ProdutoItem
            item={item}
            excluirProduto={excluirProduto}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
  },

  card: {
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});