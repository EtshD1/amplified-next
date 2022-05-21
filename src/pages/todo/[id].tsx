import { GRAPHQL_AUTH_MODE } from "@aws-amplify/auth";
import { API, withSSRContext } from "aws-amplify";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import {
	DeleteTodoInput,
	DeleteTodoMutation,
	GetTodoQuery,
	ListTodosQuery,
	Todo,
} from "../../API";
import styles from "../../../styles/Home.module.css";
import { getTodo, listTodos } from "../../graphql/queries";
import { deleteTodo } from "../../graphql/mutations";

export const getStaticPaths: GetStaticPaths = async () => {
	const SSR = withSSRContext();

	const todosQuery = (await SSR.API.graphql({
		query: listTodos,
		authMode: GRAPHQL_AUTH_MODE.API_KEY,
	})) as { data: ListTodosQuery; errors: any[] };

	const paths = todosQuery.data.listTodos!.items.map((todo) => ({
		params: { id: todo!.id },
	}));

	return {
		fallback: true,
		paths,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const SSR = withSSRContext();

	const response = (await SSR.API.graphql({
		query: getTodo,
		variables: {
			id: params!.id,
		},
	})) as { data: GetTodoQuery };

	return {
		props: {
			todo: response.data.getTodo,
		},
	};
};

const Todo = ({ todo }: { todo: Todo }) => {
	const router = useRouter();

	if (router.isFallback) {
		return <>Loading</>;
	}

	const handleDelete = async () => {
		try {
			const deleteInput: DeleteTodoInput = {
				id: todo.id,
			};

			const request = (await API.graphql({
				authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				query: deleteTodo,
				variables: {
					input: deleteInput,
				},
			})) as { data: DeleteTodoMutation; errors: any[] };

			router.push(`/`);
		} catch (error) {
			console.error(error);
			throw new Error(
				"Something went wrong during Deleting todo. Check the console logs for more"
			);
		}
	};

	return (
		<div className={styles.container}>
			<main>
				<h3>{todo.name}</h3>
				<div>{todo.description}</div>
			</main>
			<button onClick={handleDelete}>Delete Todo</button>
		</div>
	);
};

export default Todo;
