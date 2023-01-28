import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, Alert } from "react-native";
import dayjs from "dayjs";

import { api } from "../lib/axios"
import { generateDatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning";

import { HabitDay, daySize } from "../components/HabitDay";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const summaryDates = generateDatesFromYearBeginning();
const minimumSummaryDatesSize = 18 * 7;
const amountOfSummaryDatesToFill = minimumSummaryDatesSize - summaryDates.length;

type Summary = {
    id: string;
    date: string;
    amount: number;
    completed: number;
}[]

export function Home() {
    const [summary, setSummary] = useState<Summary | null>([]);
    const [loading, setLoading] = useState(true);

    const { navigate } = useNavigation();

    async function fetchData() {
        try {
            setLoading(true);
            const response = await api.get('/summary');
            console.log(response.data)
            setSummary(response.data);
        } catch (error) {
            Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos.');
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <Loading />
        )
    }

    return (
        <View className="flex-1 bg-background px-8 pt-16">
            <Header />

            <View className="flex-row mt-6 mb-2">
                {
                    weekDays.map((weekDay, index) => (
                        <Text
                            key={`${weekDay}-${index}`}
                            className="text-zinc-400 text-xl font-bold text-center mx-1"
                            style={{ width: daySize }}
                        >
                            {weekDay}
                        </Text>
                    ))
                }
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {
                    summary &&
                    <View className="flex-row flex-wrap">
                        {
                            summaryDates.map((date) => {
                                const dayWithHabits = summary.find(day => {
                                    return dayjs(date).isSame(day.date, 'day')
                                })
                                return (
                                    <HabitDay
                                        key={date.toISOString()}
                                        date={date}
                                        amount={dayWithHabits?.amount}
                                        completed={dayWithHabits?.completed}
                                        onPress={() => navigate('habit', { date: date.toISOString() })}
                                    />
                                )
                            })
                        }
                        {
                            amountOfSummaryDatesToFill > 0 && Array
                                .from({ length: amountOfSummaryDatesToFill })
                                .map((_, index) => (
                                    <View
                                        key={index}
                                        className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                                        style={{ width: daySize, height: daySize }}
                                    />
                                ))
                        }
                    </View>
                }
            </ScrollView>
        </View>
    )
}