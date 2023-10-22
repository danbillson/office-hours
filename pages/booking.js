import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, addWeeks, format, isWeekend, startOfWeek } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs";
import styled from "styled-components";
import ColourPicker from "../components/colourPicker";
import Day from "../components/day";

const formatWeek = (week) => format(week, "MM-dd-yyyy").toString();

export default function Booking({ user }) {
  const router = useRouter();

  useEffect(() => {
    if (!user?.name) router.push("/");
  }, [user?.name]);

  const queryClient = useQueryClient();

  const today = new Date();
  const [currentWeek, setCurrentWeek] = useState(() =>
    startOfWeek(isWeekend(today) ? addDays(today, 2) : today, {
      weekStartsOn: 1,
    })
  );

  const weekQueryKey = formatWeek(currentWeek);
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/dates/${weekQueryKey}`],
  });

  const prefetchBookings = async (amount) => {
    await queryClient.prefetchQuery({
      queryKey: [`/api/dates/${formatWeek(addWeeks(currentWeek, amount))}`],
      staleTime: 5000,
    });
  };

  const weekStarting = format(currentWeek, "dd/MM");

  const changeWeek = (amount) =>
    setCurrentWeek((week) => addWeeks(week, amount));

  return (
    <>
      <Header>
        <User>
          It's a me, <b>{user?.name}</b> 🍄
        </User>
        <ColourPicker user={user?.name} week={weekQueryKey} />
      </Header>
      <WeekSelect>
        <BsCaretLeftFill
          onClick={() => {
            changeWeek(-1);
            prefetchBookings(-2);
          }}
          onMouseOver={() => prefetchBookings(-1)}
        />
        <h4>Week {weekStarting}</h4>
        <BsCaretRightFill
          onClick={() => {
            changeWeek(1);
            prefetchBookings(2);
          }}
          onMouseOver={() => prefetchBookings(1)}
        />
      </WeekSelect>
      <WeekPreview>
        {isLoading
          ? "Loading..."
          : error
          ? "An error occured try to get bookings"
          : data?.map((date) => (
              <Day key={date.date} user={user} week={weekQueryKey} {...date} />
            ))}
      </WeekPreview>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const serialisedUser = ctx.req.cookies["office-hours"];
  const user = serialisedUser ? JSON.parse(serialisedUser) : null;

  return {
    props: { user },
  };
}

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  padding: 12px 2rem;
  max-width: 1200px;
  width: 100%;
  box-sizing: border-box;
`;

const User = styled.p`
  margin: 0;
  font-weight: 300;
  font-size: 20px;
`;

const WeekSelect = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 48px auto 24px;
  font-size: 36px;

  h4 {
    margin: 0 36px;
  }

  svg {
    fill: ${({ theme }) => theme.colors.black};
    cursor: pointer;
  }
`;

const WeekPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 48px 16px;
  padding: 0 16px;
  margin: 0 auto;
  max-width: 1200px;

  @media screen and (min-width: 475px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;
