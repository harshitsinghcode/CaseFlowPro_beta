import AuthProvider from "@smartindia/components/AuthHook";
import ProfileNavbarComponent from "@smartindia/components/navbar/profile";
import supabase from "@smartindia/components/supabase";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [bg, setBg] = useState<string>("");
  const [data, setData] = useState<IDataProps>();
  const [email, setEmail] = useState<string>("");
  const [button, setButton] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [repw, setRepw] = useState<string>("");
  const [error, setError] = useState<boolean>();
  const [success, setSuccess] = useState<string>("");
  const [profile, setProfile] = useState<string>("");
  const [form, setForm] = useState<IDataProps>({
    alma_mater: "",
    created_at: "",
    current_tenure: "",
    id: 0,
    name: "",
    preferred_title: "",
    user_id: "",
  });

  const iframeRef = useRef(null);

  useEffect(() => {
    setBg(theme === "dark" ? "bg-zinc-950" : "");
    setButton(theme === "dark" ? "bg-zinc-50 hover:bg-zinc-200 text-zinc-900" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200");
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      const user = await supabase.auth.getUser();
      if (!user) {
        // Redirect user to login if not authenticated
        router.push("/login");
        return;
      }
      const id = user.data.user?.id;
      const { data, error } = await supabase.from("users").select("*").eq("user_id", id).single();
      setData(data);
      setEmail(user.data.user?.email!);
    };
    fetchData();
  }, [router]);

  const HandleProfileUpdate = async () => {
    const user = await supabase.auth.getUser();
    const id = user.data.user?.id;
    const res = await supabase.from("users").select().eq("user_id", `${id}`).single();
    const record_id = res.data.id;
    const { data, error } = await supabase.from("users").update({
      name: form.name,
      alma_mater: form.alma_mater,
      current_tenure: form.current_tenure,
      preferred_title: form.preferred_title,
    }).eq("id", `${record_id}`);

    if (error) {
      setProfile(error.details);
    }
    setProfile("Profile updated successfully!");
  };

  useEffect(() => {
    if (iframeRef.current) {
      // Add an event listener to capture XAPI statements
      iframeRef.current.contentWindow.addEventListener('message', (event) => {
        if (event.origin !== 'https://h5p.ipropel.co.in') {
          console.warn("Message received from unknown origin:", event.origin);
          return;
        }

        try {
          const xapiStatement = JSON.parse(event.data);
          console.log('xAPI Statement:', xapiStatement);

          // Log the intercepted data
          console.log('Intercepted data:', xapiStatement);

          // Send the intercepted data to the middleware
          sendDataToMiddleware(xapiStatement);
        } catch (error) {
          console.error('Error parsing xAPI statement:', error);
        }
      });

      // Check if H5P externalDispatcher exists (optional, for more control)
      const h5pWindow = iframeRef.current.contentWindow;
      if (h5pWindow.H5P && h5pWindow.H5P.externalDispatcher) {
        h5pWindow.H5P.externalDispatcher.on('xAPI', (event) => {
          // Handle XAPI events from H5P externalDispatcher
          console.log('H5P externalDispatcher xAPI event:', event);
        });
      } else {
        console.warn('H5P externalDispatcher not found in iframe');
      }
    }
  }, []);

  // Function to send intercepted data to the middleware
  const sendDataToMiddleware = (data) => {
    // Modify the data if needed (e.g., add additional fields)
    const modifiedData = { ...data, additionalField: 'value' };
    console.log('sending data to middleware:', modifiedData);

    // Send the data to the middleware using fetch
    fetch('http://localhost:6700/api/processData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modifiedData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to send data to middleware: ${response.statusText}`);
      }
      console.log('Data sent to middleware successfully');
    })
    .catch(error => {
      console.error('Error sending data to middleware:', error);
    });
  };

  return (
    <AuthProvider>
      <>
        <ProfileNavbarComponent />
        <main className={`min-h-screen ${bg} py-8`}>
          <section className="px-8">
            <section className="text-5xl font-extrabold tracking-tight">Your Profile</section>
            <section className="py-4 flex gap-8 justify-between items-center">
              <section className="w-1/3 pr-6 border-r-[1px]">
                <section className="py-4 text-2xl font-semibold tracking-tight">Name</section>
                <input
                  className="h-12 p-4 w-full rounded-md border"
                  placeholder={data?.name}
                  type="textarea"
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                  }}
                />
                <section className="py-4 text-2xl font-semibold tracking-tight">Alma Mater</section>
                <input
                  className="h-12 p-4 w-full rounded-md border"
                  type="textarea"
                  placeholder={data?.alma_mater}
                  onChange={(e) => {
                    setForm({ ...form, alma_mater: e.target.value });
                  }}
                />
                <section className="py-4 text-2xl font-semibold tracking-tight">Current Tenure</section>
                <input
                  className="h-12 p-4 w-full rounded-md border"
                  type="textarea"
                  placeholder={data?.current_tenure}
                  onChange={(e) => {
                    setForm({ ...form, current_tenure: e.target.value })
                  }} />
              </section>
              <section className="w-1/3">
                <section className="py-4 text-2xl font-semibold tracking-tight">Your preferred title</section>
                <input
                  className="h-12 p-4 w-full rounded-md border"
                  type="textarea"
                  placeholder={data?.preferred_title}
                  onChange={(e) => {
                    setForm({ ...form, preferred_title: e.target.value })
                  }}
                />
                <section className="py-4 text-2xl font-semibold tracking-tight">Your mail</section>
                <input
                  className="h-12 p-4 w-full rounded-md border"
                  type="textarea"
                  disabled={true}
                  placeholder={email}
                />
                {
                  profile ? <section className="py-2 text-xl font-semibold text-green-500">{profile}</section> : <section className="py-2 text-xl font-semibold text-red-500">{profile}</section>
                }
                <button className={`${button} px-4 py-2 my-2 rounded-md font-semibold text-lg`} onClick={HandleProfileUpdate}>
                  Save
                </button>
              </section>
              <section className="w-1/3">
                <section className="flex flex-col gap-4 items-center">
                  <img
                    src={`https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png`}
                    alt="Profile Picture"
                    className="rounded-full h-64 w-64"
                  />
                </section>
              </section>
            </section>
            <section className="py-8 text-5xl font-extrabold tracking-tight">Your password</section>
            <section className="">
              <section className="py-4 text-2xl font-semibold tracking-tight">Enter your new password</section>
              <input
                className="h-12 p-4 w-1/2 rounded-md border"
                // placeholder='Shush! Your password is a secret!'
                type="password"
                onChange={(e) => setPw(e.target.value)}
              />
              <section className="py-4 text-2xl font-semibold tracking-tight">Re-enter your new password</section>
              <input
                className="h-12 p-4 w-1/2 rounded-md border"
                // placeholder='Shush! Your password is a secret!'
                type="password"
                onChange={(e) => setRepw(e.target.value)}
              />
              {error ? <section className="py-2 text-xl font-semibold text-green-500">{success}</section> : <section className="py-2 text-xl font-semibold text-red-500">{success}</section>}
              {/* <button className={"my-4 w-1/2 flex justify-end items-center p-2 rounded-md font-semibold"} onClick={HandlePasswordUpdate}> */}
                {/* <p className={`p-2 rounded-md ` + button}>Change password</p>
              </button> */}
            </section>
          </section>
        </main>
        <section className="w-full flex justify-center">
          <iframe
            ref={iframeRef}
            title="H5P Content"
            src="https://h5p.ipropel.co.in/h5p/play/1036673971"
            className="w-full h-[500px] mt-8"
          />
        </section>
      </>
    </AuthProvider>
  );
}
