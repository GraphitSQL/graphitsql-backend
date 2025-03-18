--
-- PostgreSQL database dump
--

-- Dumped from database version 11.14
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    note_text text NOT NULL,
    is_resolved boolean DEFAULT false NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    created_by_id uuid,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: projects_edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_edges (
    id public.citext NOT NULL,
    project_id uuid NOT NULL,
    source uuid NOT NULL,
    target uuid NOT NULL,
    source_handle text NOT NULL,
    target_handle text NOT NULL,
    type text DEFAULT 'smoothstep'::text NOT NULL,
    marker_end text DEFAULT 'hasMany'::text NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: projects_nodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_nodes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    "position" jsonb NOT NULL,
    type text DEFAULT 'table'::text NOT NULL,
    data jsonb NOT NULL,
    measured jsonb NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: projects_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    can_edit boolean DEFAULT true NOT NULL,
    can_leave_notes boolean DEFAULT true NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: user_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_credentials (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    password text NOT NULL,
    refresh_token text,
    refresh_token_expires_at timestamp without time zone,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text NOT NULL,
    display_name text NOT NULL,
    avatar_color text DEFAULT 'red'::text NOT NULL,
    about text,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp(3) with time zone
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: projects_nodes PK_05bb7bf2694b34db0a0f521f23c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_nodes
    ADD CONSTRAINT "PK_05bb7bf2694b34db0a0f521f23c" PRIMARY KEY (id);


--
-- Name: projects_edges PK_19c3cea76ca9bc18f373a2fd7c0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_edges
    ADD CONSTRAINT "PK_19c3cea76ca9bc18f373a2fd7c0" PRIMARY KEY (id);


--
-- Name: projects_users PK_3fdba03cb5a1887699cb7c629f2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT "PK_3fdba03cb5a1887699cb7c629f2" PRIMARY KEY (id);


--
-- Name: user_credentials PK_5cadc04d03e2d9fe76e1b44eb34; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT "PK_5cadc04d03e2d9fe76e1b44eb34" PRIMARY KEY (id);


--
-- Name: projects PK_6271df0a7aed1d6c0691ce6ac50; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: notes PK_af6206538ea96c4e77e9f400c3d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY (id);


--
-- Name: user_credentials UQ_dd0918407944553611bb3eb3ddc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT "UQ_dd0918407944553611bb3eb3ddc" UNIQUE (user_id);


--
-- Name: projects_users UQ_projects_users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT "UQ_projects_users" UNIQUE (project_id, user_id);


--
-- Name: IDX_notes_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notes_created_by" ON public.notes USING btree (user_id);


--
-- Name: IDX_projects_edges_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_projects_edges_project_id" ON public.projects_edges USING btree (project_id);


--
-- Name: IDX_projects_nodes_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_projects_nodes_project_id" ON public.projects_nodes USING btree (project_id);


--
-- Name: UQ_users_email_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UQ_users_email_deleted_at" ON public.users USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: notes FK_notes_project_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "FK_notes_project_id" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: notes FK_notes_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT "FK_notes_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects_edges FK_projects_edges_project_nodes_source; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_edges
    ADD CONSTRAINT "FK_projects_edges_project_nodes_source" FOREIGN KEY (source) REFERENCES public.projects_nodes(id) ON DELETE CASCADE;


--
-- Name: projects_edges FK_projects_edges_project_nodes_target; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_edges
    ADD CONSTRAINT "FK_projects_edges_project_nodes_target" FOREIGN KEY (target) REFERENCES public.projects_nodes(id) ON DELETE CASCADE;


--
-- Name: projects_nodes FK_projects_nodes_project_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_nodes
    ADD CONSTRAINT "FK_projects_nodes_project_id" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects_users FK_projects_users_project_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT "FK_projects_users_project_id" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects_users FK_projects_users_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT "FK_projects_users_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects FK_users_projects_created_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "FK_users_projects_created_by" FOREIGN KEY (created_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_credentials FK_users_user_crendentials; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_credentials
    ADD CONSTRAINT "FK_users_user_crendentials" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

