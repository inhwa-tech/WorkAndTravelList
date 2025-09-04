import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from "./colors";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [done, setDone] = useState(false);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [isEditing, setIsEditing] = useState(false); //수정 모드 확인
  const [editKey, setEditKey] = useState(null); // 수정 중인 key 저장
  const [editText, setEditText] = useState(""); // 수정 내용 저장
  const textInputRef = useRef(null);
  useEffect(() => {
    loadToDos();
  }, []);
  useEffect(() => {
    if (isEditing && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isEditing]);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => { // asyncStorage에 ToDo 저장 
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => { // asyncStorage에서 ToDo 불러오기 
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(s ? JSON.parse(s) : {});
  };
  const addToDo = async () => { // ToDo 생성 
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, done },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => { // ToDo list 삭제 
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  const checkToDo = (key) => { // ToDo 체크 표시
    const newToDos = { ...toDos };
    if(newToDos[key].done === false) {
      newToDos[key].done = true;
    } else {
      newToDos[key].done = false;
    };
    setToDos(newToDos); //상태 업데이트
    saveToDos(newToDos); //변경 내용 저장
  };
  const startEditing = (key) => {
    setIsEditing(true);
    setEditKey(key);
    setEditText(toDos[key].text) 
  };
  const saveEditing = () => {
    const newToDos = { ...toDos };
    newToDos[editKey].text = editText;
    setToDos(newToDos);
    saveToDos(newToDos);
    setIsEditing(false);
    setEditKey(null);
    setEditText("");
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType='done'
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input} />
      <ScrollView style={{ marginTop: 15 }}>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {isEditing && editKey === key ? (
                <TextInput ref={textInputRef}
                style={styles.toDoText}
                value={editText}
                onChangeText={setEditText}
                onSubmitEditing={saveEditing}
                returnKeyType='done'
                autoFocus={true} />
              ) : (
              <Text style={toDos[key].done ? styles.doneText : styles.toDoText}>
                {toDos[key].text}
              </Text>
              )}
              <View style={styles.toDoIcons}>
                <TouchableOpacity onPress={() => startEditing(key)} style={{ marginRight: 10}}>
                  <FontAwesome5 name="edit" size={18} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)} style={{ marginRight: 15}}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => checkToDo(key)}>
                  {toDos[key].done ? (
                    <Fontisto name="checkbox-active" size={24} color="white" style={{ alignItems: "" }} />
                  ) : (
                    <Fontisto name="checkbox-passive" size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  doneText: {
    color: "white",
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
  toDoIcons: {
    flexDirection: "row",
    alignItems:"center",
  }
});
