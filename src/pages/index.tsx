import { GRAPHQL_AUTH_MODE } from "@aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
import { API, withSSRContext } from "aws-amplify";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "../../styles/Home.module.css";
import {
	CreateTodoInput,
	CreateTodoMutation,
	ListTodosQuery,
	Todo,
} from "../API";
import { createTodo } from "../graphql/mutations";
import { listTodos } from "../graphql/queries";
import "@aws-amplify/ui-react/styles.css";

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const SSR = withSSRContext({ req });

	const response = (await SSR.API.graphql({ query: listTodos })) as {
		auth: any;
		data: ListTodosQuery;
	};

	return {
		props: {
			todos: response.data.listTodos!.items,
		},
	};
};

const Form = () => {
	const router = useRouter();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const addTodo = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("here");
		try {
			const createInput: CreateTodoInput = {
				name,
				description,
			};

			const request = (await API.graphql({
				authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				query: createTodo,
				variables: {
					input: createInput,
				},
			})) as { data: CreateTodoMutation; errors: any[] };

			router.push(`/todo/${request.data.createTodo!.id}`);
		} catch (error) {
			console.error(error);
			throw new Error(
				"Something went wrong during Add todo Form. Check the console logs for more"
			);
		}
	};

	return (
		<form onSubmit={addTodo}>
			<h1>Add Todo</h1>
			<input
				type="text"
				value={name}
				placeholder="Name"
				onChange={(e) => {
					setName(e.target.value);
				}}
			/>
			<input
				type="text"
				value={description}
				placeholder="Description"
				onChange={(e) => {
					setDescription(e.target.value);
				}}
			/>
			<input type="submit" value="Add" />
		</form>
	);
};

const Home = ({ todos = [] }: { todos: Todo[] }) => {
	return (
		<div className={styles.container}>
			<h2>Todos</h2>
			<div className={styles.grid}>
				{todos.map((todo) => {
					return (
						<Link key={todo.id} href={`/todo/${todo.id}`}>
							<div>
								<h3>{todo.name}</h3>
								<p>{todo.description}</p>
							</div>
						</Link>
					);
				})}
			</div>
			<div>
				<Authenticator>
					<Form />
				</Authenticator>
			</div>
		</div>
	);
};

export default Home;
